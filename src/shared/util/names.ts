export function normaliseName(name: string | null | undefined): string | null {
    if (!name) return null;

    let s = name.normalize('NFKC').trim();

    // &quot;TEXT&quot; &amp; &lt;TEXT&gt; -> "TEXT" & <TEXT>
    s = s
        .replace(/&quot;/gi, '"')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');

    // 'TEXT /////// TEXT' -> 'TEXT TEXT'
    s = s.replace(/\/+/g, ' ');

    // „TEXT” «TEXT» “TEXT” ‟TEXT‟ => "TEXT"
    s = s.replace(/[„”«»“”‟]/g, '"');

    //  ,,TEXT,, ''TEXT'' => "TEXT"
    s = s.replace(/,,/g, '"');
    s = s.replace(/''/g, '"');

    // ""TEXT"" => "TEXT"
    s = s.replace(/"{2,}/g, '"');

    // ‘TEXT’ -> 'TEXT'
    s = s.replace(/[’`´]/g, "'");

    // 'TEXT"TEXT' -> 'TEXT "TEXT'
    s = s.replace(/([\p{L}\p{N}])"/gu, '$1 "');
    s = s.replace(/"([\p{L}\p{N}])/gu, '" $1');
    s = s.replace(/\s+/g, ' ');

    // '-TEXT', '— TEXT' -> ' - TEXT'
    s = s.replace(/\s*[-–—]\s*/g, ' - ');

    // ', , TEXT, , ' -> 'TEXT'
    s = s.replace(/,\s*,+/g, ',');
    s = s.replace(/\s*,\s*/g, ', ');

    // '" text "' -> '"text"'
    s = s.replace(/"\s*([^"\n]+?)\s*"/g, '"$1"');

    // ' ( TEXT ) ' -> '(TEXT)'
    s = s.replace(/\(\s*([^)\n]+?)\s*\)/g, '($1)');

    return s.length ? s : null;
}
