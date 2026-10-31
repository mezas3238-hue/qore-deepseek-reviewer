-- QORE CRT ALERTS - OFFLINE PostgreSQL schema extension.
-- NOT applied to Supabase or Railway. No HTTP/FCM permissions.
BEGIN;
ALTER TABLE qore_crt_alerts.qa_device_registrations
  ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 1
    CHECK (revision>=1);

-- This function requires the caller to have table privileges and to have
-- verified Firebase Auth AND App Check upstream. No blanket grants exist.
-- Expected revision is a compare-and-swap safeguard against stale replay.
CREATE OR REPLACE FUNCTION qore_crt_alerts.qa_stage_device(
 p_handle TEXT,p_user_hash TEXT,p_installation_hash TEXT,
 p_project_id TEXT,p_expected_revision BIGINT,p_opted_in BOOLEAN
) RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $qa$
DECLARE new_revision BIGINT;
DECLARE existing qore_crt_alerts.qa_device_registrations%ROWTYPE;
BEGIN
 IF p_handle !~ '^[a-f0-9]{64}$' OR
    p_user_hash !~ '^[a-f0-9]{64}$' OR
    p_installation_hash !~ '^[a-f0-9]{64}$' OR
    p_project_id IS NULL OR length(p_project_id)<12 OR
    p_expected_revision IS NULL OR p_expected_revision<0 OR
    p_opted_in IS DISTINCT FROM TRUE THEN
   RAISE EXCEPTION 'QA_DEVICE_INVALID_OR_MISSING_CONSENT' USING ERRCODE='23514';
 END IF;
 IF p_expected_revision=0 THEN
   INSERT INTO qore_crt_alerts.qa_device_registrations d
    (handle,user_scope_hash,installation_hash,project_id,consented,active)
   VALUES (p_handle,p_user_hash,p_installation_hash,p_project_id,TRUE,TRUE)
   ON CONFLICT (handle) DO NOTHING
   RETURNING d.revision INTO new_revision;
   IF FOUND THEN
     RETURN jsonb_build_object('state','QA_DEVICE_REGISTERED','revision',new_revision);
   END IF;
   SELECT * INTO existing FROM qore_crt_alerts.qa_device_registrations
     WHERE handle=p_handle;
   IF existing.user_scope_hash=p_user_hash AND
      existing.installation_hash=p_installation_hash AND
      existing.project_id=p_project_id AND existing.active=TRUE THEN
      RETURN jsonb_build_object('state','QA_DEVICE_DUPLICATE',
        'revision',existing.revision);
   END IF;
   RAISE EXCEPTION 'QA_DEVICE_CONFLICT_OR_REVOKED' USING ERRCODE='23514';
 END IF;
 UPDATE qore_crt_alerts.qa_device_registrations d
   SET installation_hash=p_installation_hash,
       observed_at=transaction_timestamp(),
       expires_at=transaction_timestamp()+INTERVAL '30 days',
       revision=d.revision+1
 WHERE d.handle=p_handle AND d.user_scope_hash=p_user_hash
   AND d.project_id=p_project_id AND d.active=TRUE
   AND d.consented=TRUE AND d.revision=p_expected_revision
 RETURNING d.revision INTO new_revision;
 IF NOT FOUND THEN
   RAISE EXCEPTION 'QA_DEVICE_STALE_REVISION_OR_WRONG_OWNER' USING ERRCODE='23514';
 END IF;
 RETURN jsonb_build_object('state','QA_DEVICE_ROTATED_OR_REFRESHED',
   'revision',new_revision);
END $qa$;

CREATE OR REPLACE FUNCTION qore_crt_alerts.qa_revoke_device(
 p_handle TEXT,p_user_hash TEXT,p_expected_revision BIGINT
) RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $qa$
DECLARE new_revision BIGINT;
BEGIN
 UPDATE qore_crt_alerts.qa_device_registrations d
  SET active=FALSE,revision=d.revision+1
 WHERE d.handle=p_handle AND d.user_scope_hash=p_user_hash
   AND d.active=TRUE AND d.revision=p_expected_revision
 RETURNING d.revision INTO new_revision;
 IF NOT FOUND THEN
   RAISE EXCEPTION 'QA_DEVICE_REVOCATION_CONFLICT' USING ERRCODE='23514';
 END IF;
 RETURN jsonb_build_object('state','QA_DEVICE_REVOKED','revision',new_revision);
END $qa$;

REVOKE ALL ON FUNCTION qore_crt_alerts.qa_stage_device(
 TEXT,TEXT,TEXT,TEXT,BIGINT,BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION qore_crt_alerts.qa_revoke_device(
 TEXT,TEXT,BIGINT) FROM PUBLIC;
COMMENT ON FUNCTION qore_crt_alerts.qa_stage_device(
 TEXT,TEXT,TEXT,TEXT,BIGINT,BOOLEAN) IS
 'Server-authorized QA only, revision CAS; never enables delivery.';
COMMIT;
