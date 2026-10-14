// GitHub activity: 53x7 contribution grid with an animated snake.
// Adapted from the Codex Activity canvas; data is static/uploads/github-activity.json,
// generated at build time by scripts/generate-github-activity.mjs.
(() => {
  const canvas = document.querySelector("[data-github-activity-canvas]");
  if (!canvas) return;

  const panel = canvas.closest(".github-activity-panel");
  const columns = 53;
  const rows = 7;
  const snakeLength = 7;
  const stepDuration = 70;
  const cells = [];
  let pathCells = [];
  let activity = new Map();
  let animationFrame = 0;
  let startTime = 0;
  let layout = null;

  const dateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const addDays = (date, amount) => {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + amount);
    return shifted;
  };

  const isDark = () => document.documentElement.classList.contains("dark");

  const roundedCell = (ctx, x, y, size, radius, color) => {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fillStyle = color;
    ctx.fill();
  };

  function prepareCells() {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const start = addDays(today, -(52 * 7 + today.getDay()));
    cells.length = 0;
    pathCells = [];

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const date = addDays(start, column * 7 + row);
        cells.push({ column, row, future: date > today, count: activity.get(dateKey(date)) ?? 0 });
      }
      // The snake zig-zags: down one column, up the next.
      const order = [...Array(rows).keys()];
      if (column % 2 === 1) order.reverse();
      for (const row of order) pathCells.push(cells.find((c) => c.column === column && c.row === row));
    }
  }

  function prepareCanvas() {
    const width = Math.max(260, Math.floor(canvas.getBoundingClientRect().width));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const gap = Math.max(1, width * 0.0032);
    const cellSize = Math.max(3, (width - gap * (columns - 1)) / columns);
    const height = Math.ceil(cellSize * rows + gap * (rows - 1));

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    layout = { context, width, height, gap, cellSize };
  }

  const palette = () =>
    isDark()
      ? {
          empty: "#2f3542",
          future: "#252a34",
          levels: ["#244d64", "#1f7180", "#149a91", "#18bfa2"],
          snake: ["#7dd3fc", "#38bdf8", "#2563eb", "#1d4ed8"],
        }
      : {
          empty: "#e9edf2",
          future: "#f3f4f6",
          levels: ["#bcebdc", "#75d8bc", "#2fbf9d", "#098a75"],
          snake: ["#93c5fd", "#60a5fa", "#2962ff", "#1d4ed8"],
        };

  // Rank a day among all active days so the colour scale adapts to the user's own range.
  function level(count, activeValues) {
    if (!count || !activeValues.length) return -1;
    const rank = activeValues.findIndex((value) => count <= value);
    const percentile = (rank === -1 ? activeValues.length - 1 : rank) / Math.max(1, activeValues.length - 1);
    return Math.min(3, Math.floor(percentile * 4));
  }

  function draw(progress = -1) {
    if (!layout) return;
    const { context, gap, cellSize } = layout;
    const colors = palette();
    const activeValues = cells.filter((c) => c.count > 0).map((c) => c.count).sort((a, b) => a - b);
    const eaten = new Set(pathCells.slice(0, Math.max(0, progress + 1)));

    context.clearRect(0, 0, layout.width, layout.height);
    for (const cell of cells) {
      const lvl = level(cell.count, activeValues);
      const color = cell.future ? colors.future : eaten.has(cell) || lvl === -1 ? colors.empty : colors.levels[lvl];
      roundedCell(context, cell.column * (cellSize + gap), cell.row * (cellSize + gap), cellSize, Math.max(1, cellSize * 0.24), color);
    }

    if (progress < 0) return;
    for (let offset = snakeLength - 1; offset >= 0; offset -= 1) {
      const cell = pathCells[progress - offset];
      if (!cell) continue;
      const idx = Math.min(colors.snake.length - 1, Math.floor(((snakeLength - offset) / snakeLength) * colors.snake.length));
      roundedCell(context, cell.column * (cellSize + gap), cell.row * (cellSize + gap), cellSize, Math.max(1, cellSize * 0.28), colors.snake[idx]);
    }
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const totalSteps = pathCells.length + snakeLength;
    const elapsed = timestamp - startTime;
    const progress = Math.floor(elapsed / stepDuration);

    if (progress > totalSteps) {
      if (elapsed > totalSteps * stepDuration + 1250) startTime = timestamp;
      draw(totalSteps);
    } else {
      draw(progress);
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function restart() {
    window.cancelAnimationFrame(animationFrame);
    prepareCells();
    prepareCanvas();
    startTime = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) draw(-1);
    else animationFrame = window.requestAnimationFrame(animate);
  }

  const setStatus = (text) => {
    const el = panel && panel.querySelector("[data-github-status]");
    if (el) el.textContent = text;
  };

  fetch(canvas.dataset.source)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      activity = new Map(data.days.map((day) => [day.date, day.count]));
      setStatus(`${data.total} contributions in the last year`);
      restart();

      new ResizeObserver(restart).observe(canvas);
      new MutationObserver(() => draw(-1)).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    })
    .catch(() => setStatus("Activity data unavailable"));
})();
