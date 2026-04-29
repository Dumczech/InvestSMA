export const calcDelta=(lrm:number,market:number)=>({delta:lrm-market,deltaPercent:market===0?0:((lrm-market)/market)*100});
export const outperformanceLabel=(pct:number)=> pct>=0?`outperform by ${pct.toFixed(1)}%`:`underperform by ${Math.abs(pct).toFixed(1)}%`;
