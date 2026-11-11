"""QA guard: DeepSeek's 20 source fragments must reconstruct exact R4-A bytes."""
from pathlib import Path
import hashlib
import unittest

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "QORE_CRT_34_R4_AB_400_M5_AUTO_BUFFER_QA.pine"
PARTS = ROOT / "for-deepseek/r4a-source"
BLOB = "693e3f49719e86e2ea0702f7b355af33bd0c4c7c"

def expected_files():
    return [
        PARTS / f"PART_{i:02d}_L{(i-1)*180+1:04d}-{min(i*180,3547):04d}.txt"
        for i in range(1,21)
    ]

class ExactSourceForDeepseek(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.files = expected_files()
        cls.src = ORIGINAL.read_bytes()
        cls.bytes = [p.read_bytes() for p in cls.files]
    def test_01_all_twenty_files_exist(self):
        self.assertEqual(len(self.files),20)
        self.assertTrue(all(p.is_file() for p in self.files))
        self.assertEqual(set(PARTS.glob("PART_*.txt")),set(self.files))
    def test_02_exact_bytes_reconstruct(self):
        self.assertEqual(b"".join(self.bytes),self.src)
    def test_03_exact_github_blob_sha(self):
        b=b"".join(self.bytes)
        h=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
        self.assertEqual(h,BLOB)
    def test_04_chunks_are_bounded(self):
        self.assertLessEqual(max(map(len,self.bytes)),25000)
    def test_05_contiguous_line_partition_and_terminal_newline(self):
        self.assertEqual(sum(len(b.splitlines()) for b in self.bytes),len(self.src.splitlines()))
        self.assertEqual(len(self.src.splitlines()),3546)
        self.assertTrue(all(b.endswith(b"\n") for b in self.bytes))
        self.assertEqual([len(b.splitlines()) for b in self.bytes[:19]],[180]*19)
        self.assertEqual(len(self.bytes[19].splitlines()),126)
    def test_06_engine_and_trading_candidates_present(self):
        s=self.src.decode("utf-8")
        for needle in (
            "f_engine() =>", "f_engine_snapshot() =>",
            "qaTrue3CConfirmed", "True3CMssCandidate",
            "CRT_2C_RETURN", '3C TRUE QA',
            "qaNativeSourcePhaseMin", "MSS M5", "MSS M15",
            "const bool scanAll = true",
        ):
            self.assertIn(needle,s)
    def test_07_34_instruments(self):
        import re
        self.assertEqual(len(re.findall(r'^s\d\d = "IC:[A-Z0-9]+"$',self.src.decode("utf-8"),re.M)),34)

if __name__ == "__main__":
    unittest.main(verbosity=2)
