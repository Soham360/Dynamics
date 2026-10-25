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

## Use

- Drag a card into the sandbox, or click it to add/select its component. Click a canvas element to edit it. Arrow keys move a focused component.
- In the surface model select Surface, then Flat or an incline preset. Positive force is rightward on a flat surface and downhill on an incline. Negative force acts the other way.
- Select the quantity under **Solve for**. Worked solutions update from the current inputs and observation time. Copy LaTeX exports those steps.
- Run, pause, reset, or scrub time. Numerical answers use the **observation time** field; scrubbing previews the trajectory without changing that field.
- Switch between SI and US customary units. Internal values remain SI, avoiding accumulated conversion drift. US mass uses **slugs**, force uses **lbf**, lengths use **ft**. Slugs distinguish mass from pound-force; lbm input is not implemented.
- Save/Open experiments as versioned JSON; the most recent experiment is also restored from browser local storage. No account or backend is involved.

## Physics and display details

Calculations use g = 9.80665 m/s². Substitutions in the worked derivations use SI; final answers use the selected unit system. All units and sign conventions are visible in the interface.

Surface motion is integrated analytically with a stop event and static-friction re-evaluation, so kinetic friction cannot spuriously reverse a resting body. Initial acceleration and friction are explicitly labeled. Projectile motion ends at impact. The spring solution supports arbitrary initial displacement and velocity. Collision results are post-impact, while the animation places the instantaneous collision at 1 second for illustration.

Animations are schematics: surface, pulley, spring, and linear travel are compressed with a smooth visual mapping to keep objects visible. Projectile plots fit the full trajectory. Surface drawing steepness is capped for visibility. Canvas coordinates are never used as physical distances or constraints.

## Structure and verification

- `physics.js`: pure SI solvers, model schemas, validation, and unit conversion.
- `app.js`: state, SVG drawing, interaction, animation, persistence, and math rendering.
- `styles.css`: responsive interface and keyboard focus styles.
- `tests/physics.test.js`: analytical reference cases, conservation laws, stopping/reversal, invalid input, and unit consistency.
- `.github/workflows/checks.yml`: automated tests for pushes and pull requests.

KaTeX 0.19.1 is vendored under `vendor/katex` with its MIT license. Equations work without a CDN. Optional Google Fonts fall back to local system fonts if unavailable. The app uses no external APIs, analytics, secrets, or paid services.

The included HTTP server is intended for local development and binds to loopback only. Use a static hosting service for public deployment.
