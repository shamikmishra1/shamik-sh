const MATRIX_CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';

function generateMatrixFrame(): string {
  const width = 60;
  const height = 15;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.85) {
        line += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }

  return lines.join('\n');
}

export function matrix(): string {
  const frame = generateMatrixFrame();
  return `
${frame}

Wake up, Neo...
The Matrix has you.

(This is a static frame. For the real experience, watch the movie.)
`;
}
