export const formatValue=(value:number,unit:'currency'|'percent'|'number')=>unit==='currency'?`$${value.toLocaleString()}`:unit==='percent'?`${value}%`:value.toLocaleString();
