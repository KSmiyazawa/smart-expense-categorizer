export function parseJapaneseDate (lineText: string) {
    const japaneseDateRegex = /\d{4}年\d{1,2}月\d{1,2}日/g;

    const matches = lineText.match(japaneseDateRegex);
    if (!matches) return null;

    const japaneseDate = matches[0];

    const parts = japaneseDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!parts) return null;

    const [, year, month, day] = parts;
    return `${month}/${day}/${year}`;
}