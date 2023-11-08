const input = Deno.args[0] as string;
const inputTokens = input.split(' ');

const finalTokens: (string | number | number[])[] = [];

const transformNumber1 = (num: number) => {
    return [400 - num];
};

const transformNumbers = (num1: number, num2: number) => {
    return [400 - num1, num2];  // left -> right
    // return [num1, 400 - num2];  // up -> down
    // return [num2, num1];  // top -> left, right -> down
};

while (true) {
// for (const token of inputTokens) {
    const token = inputTokens.shift();
    if (!token)
        break;

    const parsed = Number.parseInt(token);
    const isNumber = Number.isInteger(parsed);
    console.log({token, parsed, isNumber})

    if (isNumber) {
        const parsed2 = Number.parseInt(inputTokens.shift()!);
        const transformed = transformNumbers(parsed, parsed2);
        finalTokens.push(transformed);
    } else {
        finalTokens.push(token);
    }
}

console.log(finalTokens.flat().join(' '));
