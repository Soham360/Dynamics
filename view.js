import {pageIndex} from './playback.js';
const $ = id => document.getElementById(id);
const workspace = document.querySelector('.workspace');
const compact = matchMedia('(max-width: 900px), (max-height: 550px)');
let currentView = 'sandbox', currentStep = 0, stepModel = '', stepItems = [];

function setView(view, focus = false) {
  currentView = view;
  workspace.dataset.view = view;
  for (const button of document.querySelectorAll('.view-tabs [role="tab"]')) {
    const active = button.dataset.view === view;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  }
  $('canvas-wrap').hidden = view !== 'sandbox';
  $('graph-panel').hidden = view !== 'graph';
  $('solution-panel').hidden = view !== 'solution';
  for(const panel of [workspace.querySelector('.library'),workspace.querySelector('.inspector')])panel.setAttribute('role',compact.matches?'tabpanel':'region');
  workspace.querySelector('.library').inert = compact.matches && view !== 'elements';
  workspace.querySelector('.inspector').inert = compact.matches && view !== 'properties';
  requestAnimationFrame(fitEquations);
}
for (const tab of document.querySelectorAll('.view-tabs [role="tab"]')) {
  tab.addEventListener('click', () => setView(tab.dataset.view));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll('.view-tabs [role="tab"]')].filter(button => button.getClientRects().length);
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setView(tabs[next].dataset.view, true);
  });
}
compact.addEventListener('change', () => setView(!compact.matches && ['elements', 'properties'].includes(currentView) ? 'sandbox' : currentView));

function showStep() {
  stepItems.forEach((item, index) => item.hidden = index !== currentStep);
  $('steps').hidden = stepItems[currentStep] === $('assumptions');
  $('step-count').textContent = stepItems.length ? `${currentStep + 1} / ${stepItems.length}` : 'No solution';
  $('previous-step').disabled = currentStep === 0 || !stepItems.length;
  $('next-step').disabled = currentStep >= stepItems.length - 1;
  requestAnimationFrame(fitEquations);
}
export function refreshSteps(model) {
  if (model !== stepModel) { currentStep = 0; stepModel = model; }
  stepItems = [...$('steps').querySelectorAll('.step')];
  if ($('assumptions').textContent) stepItems.push($('assumptions'));
  else $('assumptions').hidden = true;
  currentStep = pageIndex(currentStep, 0, stepItems.length);
  showStep();
}
$('previous-step').onclick = () => { currentStep = pageIndex(currentStep, -1, stepItems.length); showStep(); };
$('next-step').onclick = () => { currentStep = pageIndex(currentStep, 1, stepItems.length); showStep(); };

function fitEquations() {
  for (const row of document.querySelectorAll('.math-row')) {
    if (!row.getClientRects().length) continue;
    row.style.fontSize = '';
    const math = row.querySelector('.katex');
    if (math && math.getBoundingClientRect().width > row.clientWidth) {
      const size = parseFloat(getComputedStyle(row).fontSize);
      row.style.fontSize = `${size * row.clientWidth / math.getBoundingClientRect().width * 0.97}px`;
    }
  }
}
new ResizeObserver(() => requestAnimationFrame(fitEquations)).observe(workspace);
setView('sandbox');
