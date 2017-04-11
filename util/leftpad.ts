export default function pad(str: string, n: number, symbol: string = "    ") {
    return new Array(n).join(symbol) + str;
}
