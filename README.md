# Dynamics Lab

An interactive browser workbench for classical dynamics. Build a supported system with draggable elements, edit its parameters, animate motion, choose an unknown, and read the worked solution rendered with LaTeX.

## Run

Requires Node.js 22 or newer. No dependency installation or build step is needed.

```sh
node server.js
```

Open http://127.0.0.1:5173. Any static web host can serve the repository as well. ES modules require HTTP; opening index.html directly with file:// is not supported.

```sh
node --test tests/*.test.js
```

## Included topics

| Model | Elements and physics | Solve for |
| --- | --- | --- |
| Surfaces and forces | Block, flat/inclined plane, signed parallel force, static/kinetic friction | Initial acceleration, normal force, signed friction, velocity, displacement |
| Pulley system | Ideal two-mass Atwood machine, one fixed pulley and rope | Acceleration, tension, velocity, displacement |
| Projectile motion | Launch speed, angle, initial height; ground impact | Range, flight time, peak height, position, speed |
| Spring motion | Undamped mass-spring oscillator with initial velocity | Period, extension, velocity, acceleration, restoring force, energy |
| Circular motion | Uniform motion on a horizontal circle | Centripetal acceleration, radial force, period |
| Kinematics | Constant acceleration in one dimension | Displacement, final velocity, acceleration |
| Rotational dynamics | Fixed-axis rotor with constant net torque and inertia | Angular acceleration, velocity, displacement, energy, work |
| Impulse and collision | Two-mass 1D collision with restitution | Final velocities, impulse, dissipated energy |

This is a foundation for a broader dynamics simulator, **not yet an arbitrary multibody physics engine or coverage of every dynamics topic**. Each tab defines one explicit topology. Dropping elements enables that topology's components; moving them changes the schematic layout, not the physical connections. Duplicate components are selected rather than silently added to a solver that cannot handle them. Unsupported/incomplete systems show an explanation instead of an answer.

Future extensions include compound pulley networks, coupled bodies, rolling constraints, rigid-body planar motion, impacts in 2D, damped/forced vibrations, and general constraint assembly.

## Single-screen workbench

The app uses the browser viewport rather than a scrolling document. Choose a topic from the Experiment dropdown. Sandbox, Graph, and Solution occupy the same central panel, with the timeline below. On desktop, Elements and Properties remain beside the panel; on narrower or shorter screens they become tabs. Long solutions are paginated, including the final answer and model assumptions, and long equations split into rows and fit the panel width. The live answer stays in the sandbox header.

Playback supports ¼×, ½×, 1×, and 2×, plus an exact +0.1s step while paused. View changes and playback speed do not modify the experiment or its undo history. Arrow keys, Home, and End navigate the view tabs.

The fitted layout is checked at 1280×720, 1024×600, 1920×1080, 375×667, 390×844, and 844×390. Switching panels and solution pages replaces scrolling; it does not remove the original controls or derivation steps.

## Use

- Drag a card into the sandbox, or click it to add/select its component. Click a canvas element to edit it. Arrow keys move a focused component.
- In the surface model select Surface, then Flat or an incline preset. Positive force is rightward on a flat surface and downhill on an incline. Negative force acts the other way.
- Select the quantity under **Solve for**. Worked solutions update from the current inputs and simulation timeline. Copy LaTeX exports those steps.
- Run, pause, reset, or scrub time. The answer, equations, animation, and graph cursor use the same current simulation time, starting at zero. **Simulation duration** sets the end of the timeline.
- Switch between SI and US customary units. Internal values remain SI, avoiding accumulated conversion drift. US mass uses **slugs**, force uses **lbf**, lengths use **ft**. Slugs distinguish mass from pound-force; lbm input is not implemented.
- Undo/redo experiment edits with the toolbar or Ctrl/⌘ Z and Ctrl/⌘ Shift Z outside text fields. History includes property edits, layout moves, unit changes, resets, imports, and model changes (up to 80 snapshots per session). A new edit after undo discards the redo branch.
- The graph plots the selected quantity through the entire simulation interval. **Export data CSV** downloads all available outputs in the selected unit system, with labeled columns and 201 regular samples plus exact stopping/impact events. Infinite values export as empty cells.
- Save/Open experiments as versioned JSON; the most recent experiment is also restored from browser local storage. Imports validate parameter ranges, friction and collision constraints, unique supported elements, and drawing coordinates before replacing the current experiment. Valid unfinished systems can be saved. Invalid edits never overwrite the last valid autosave. No account or backend is involved.

## Physics and display details

Time-dependent values now evaluate at the playhead rather than at a separate observation time. Copy LaTeX includes the current time. Initial surface acceleration/friction and post-impact collision quantities retain their stated meanings; their graphs are flat. Switching tabs or editing inputs resets the playhead to zero. Playback pauses when the tab is hidden.

Calculations use g = 9.80665 m/s². Substitutions in the worked derivations use SI; final answers use the selected unit system. All units and sign conventions are visible in the interface.

Surface motion is integrated analytically with a stop event and static-friction re-evaluation, so kinetic friction cannot spuriously reverse a resting body. Initial acceleration and friction are explicitly labeled. Projectile motion ends at impact. The spring solution supports arbitrary initial displacement and velocity. Collision results are post-impact, while the animation places the instantaneous collision at 1 second for illustration.

Animations are schematics: surface, pulley, spring, and linear travel are compressed with a smooth visual mapping to keep objects visible. Projectile plots fit the full trajectory. Surface drawing steepness is capped for visibility. Canvas coordinates are never used as physical distances or constraints.

## Structure and verification

- `physics.js`: pure SI solvers, model schemas, validation, and unit conversion.
- `app.js`: state, SVG drawing, interaction, animation, persistence, and math rendering.
- `analysis.js` and `chart.js`: event-aware graph samples, CSV export, graph rendering, and the synchronized cursor.
- `experiment.js`: validated imports and detached undo/redo snapshots.
- `tests/workbench.test.js`: import rejection, history branching, event sampling, graph bounds, and CSV conversions.
- `view.js` and `playback.js`: viewport panel selection, solution pagination, equation fitting, and bounded playback timing.
- `tests/playback.test.js`: speed scaling, end limits, clock stalls, and pagination boundaries.
- `styles.css`: responsive interface and keyboard focus styles.
- `tests/physics.test.js`: analytical reference cases, conservation laws, stopping/reversal, invalid input, and unit consistency.
- `.github/workflows/checks.yml`: automated tests for pushes and pull requests.

KaTeX 0.19.1 is vendored under `vendor/katex` with its MIT license. Equations work without a CDN. Optional Google Fonts fall back to local system fonts if unavailable. The app uses no external APIs, analytics, secrets, or paid services.

The included HTTP server is intended for local development and binds to loopback only. Use a static hosting service for public deployment.
