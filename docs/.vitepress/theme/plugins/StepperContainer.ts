import type MarkdownIt from "markdown-it";

export function stepper(md: MarkdownIt) {
  md.block.ruler.before("fence", "stepper_container", (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];
    const lineContent = state.src.slice(startPos, maxPos).trim();

    if (!lineContent.match(/^:::stepper(\s|$)/)) return false;

    // Find matching closing :::
    let nextLine = startLine + 1;
    let nestingLevel = 1;

    while (nextLine < endLine) {
      const ls = state.bMarks[nextLine] + state.tShift[nextLine];
      const le = state.eMarks[nextLine];
      const content = state.src.slice(ls, le).trim();

      if (content.match(/^:::stepper(\s|$)/)) nestingLevel++;
      else if (content === ":::") {
        nestingLevel--;
        if (nestingLevel === 0) break;
      }
      nextLine++;
    }

    if (nestingLevel !== 0) return false;
    if (silent) return true;

    // Extract raw content
    const rawLines: string[] = [];
    for (let i = startLine + 1; i < nextLine; i++) {
      rawLines.push(state.src.slice(state.bMarks[i], state.eMarks[i]));
    }
    const rawContent = rawLines.join("\n").trim();

    // Parse @tab steps
    const steps: Array<{ title: string; content: string }> = [];
    const lines = rawContent.split("\n");
    let current: typeof steps[0] | null = null;

    for (const line of lines) {
      const m = line.match(/^@tab\s+(.+)$/);
      if (m) {
        if (current) steps.push(current);
        current = { title: m[1].trim(), content: "" };
      } else if (current) {
        current.content += line + "\n";
      }
    }
    if (current) steps.push(current);
    for (const s of steps) s.content = s.content.trim();

    // Open token
    const open = state.push("stepper_open", "section", 1);
    open.markup = ":::stepper";
    open.block = true;
    open.meta = { steps };
    open.map = [startLine, nextLine];

    // Close token
    const close = state.push("stepper_close", "section", -1);
    close.markup = ":::";
    close.block = true;

    state.line = nextLine + 1;
    return true;
  });

  md.renderer.rules.stepper_open = (tokens, idx) => {
    const steps = tokens[idx].meta.steps as Array<{ title: string; content: string }>;
    let html = `<StepperContainerWrapper data-total="${steps.length}">`;
    html += `<div class="stepper-container">`;
    html += `<div class="stepper-header">`;
    steps.forEach((s, i) => {
      html += `<div class="stepper-tab${i === 0 ? " active" : ""}" data-step="${i}">`;
      html += `<div class="stepper-tab-number"><span>${i + 1}</span></div>`;
      html += `<div class="stepper-tab-title">${md.utils.escapeHtml(s.title)}</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `<div class="stepper-content">`;
    steps.forEach((s, i) => {
      html += `<div class="stepper-item${i === 0 ? " active" : ""}" data-step-content="${i}">`;
      html += `<div class="stepper-item-body">${md.render(s.content)}</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `<div class="stepper-footer">`;
    html += `<button class="stepper-btn" data-prev disabled>
      <svg class="stepper-btn-arrow" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      上一步
    </button>`;
    html += `<button class="stepper-btn primary" data-next>
      下一步
      <svg class="stepper-btn-arrow" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
    </button>`;
    html += `</div></div>`;
    return html;
  };

  md.renderer.rules.stepper_close = () => `</StepperContainerWrapper>`;
}
