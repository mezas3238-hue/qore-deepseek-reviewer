// Closed-H4 C1 audit mirror. No indicator, price-feed or push actions.
export const inspectC1H4 = ({
  startHourNY, allowedHoursNY, nextHourNY, firstAt, bucketAt, endAt, nextBucketAt,
  count, continuous, minBars, high, low, isBTC
}) => {
  if(!Number.isInteger(startHourNY)||!Array.isArray(allowedHoursNY)||
     !Number.isInteger(nextHourNY)||![firstAt,bucketAt,endAt,nextBucketAt,count,minBars,high,low].every(Number.isFinite)||
     typeof continuous!=="boolean") throw new TypeError("Complete H4 fixture required");
  const candidate=allowedHoursNY.includes(startHourNY);
  const clock=nextHourNY===(startHourNY+4)%24;
  const readyData=continuous&&firstAt===bucketAt&&endAt===nextBucketAt&&
    (isBTC?(count===48&&nextBucketAt-bucketAt===14_400_000):count>=minBars);
  const range=high>low;
  const result=!candidate?"NOT_C1_HOUR":!clock?"REJECT_CLOCK":!readyData?"REJECT_DATA":!range?"REJECT_RANGE":"C1_READY";
  return Object.freeze({result,candidate,ready:result==="C1_READY",clock,readyData,range});
};
