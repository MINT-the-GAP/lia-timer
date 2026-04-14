<!--
author:   Martin Lommatzsch
version:  0.0.1
language: en
narrator: US English Female
comment:  Reveal the solution button after a configurable countdown timer. Supports immediate, on-check, and manual-start modes.

script:   ./dist/index.js

-->

# LiaScript Solution Timer

          --{{0}}--
This plugin hides the solution button in LiaScript quizzes and reveals it only after a configurable countdown. Three trigger modes are supported: immediate countdown, start after first check, or manual start via a button.

__Try it on LiaScript:__
https://liascript.github.io/course/?https://raw.githubusercontent.com/MINT-the-GAP/lia-timer/main/README.md

__See the project on GitHub:__
https://github.com/MINT-the-GAP/lia-timer

           {{1}}
1. Load the plugin via

   `import: https://raw.githubusercontent.com/MINT-the-GAP/lia-timer/main/README.md`

   or pin to a specific version:

   `import: https://raw.githubusercontent.com/MINT-the-GAP/lia-timer/0.0.1/README.md`

2. Add `data-solution-timer` attributes to your quiz comment blocks (see examples below)

3. Clone this repository on GitHub

## Usage

          --{{0}}--
Add `data-solution-timer` to the HTML comment block above a quiz question. The value is the delay before the solution button appears. Optional attributes control the trigger mode and badge visibility.

### Attributes

| Attribute | Values | Default | Description |
|---|---|---|---|
| `data-solution-timer` | `10s`, `2min`, `1:30`, `90` | — | **Required.** Countdown duration. Bare number = seconds. |
| `data-solution-timer-start` | `immediate` / `oncheck` / `onclick` | `immediate` | When the countdown starts. |
| `data-solution-timer-badge` | `on` / `off` | `on` | Show/hide the countdown badge. |
| `data-solution-timer-start-label` | any string | `Start timer` | Button label for `onclick` mode. |

### Immediate countdown

          --{{0}}--
The countdown starts as soon as the slide is loaded.

``` markdown
<!-- data-solution-timer="10s" -->
2 + 3 = [[ 5 ]]
```

---

<!-- data-solution-timer="10s" -->
2 + 3 = [[ 5 ]]

### Start after first check (`oncheck`)

          --{{0}}--
The countdown only starts after the learner clicks the check button for the first time.

``` markdown
<!-- data-solution-timer="15s" data-solution-timer-start="oncheck" -->
7 + 8 = [[ 15 ]]
```

---

<!-- data-solution-timer="15s" data-solution-timer-start="oncheck" -->
7 + 8 = [[ 15 ]]

### Silent oncheck (no badge)

``` markdown
<!-- data-solution-timer="10s" data-solution-timer-start="oncheck" data-solution-timer-badge="off" -->
9 + 6 = [[ 15 ]]
```

---

<!-- data-solution-timer="10s" data-solution-timer-start="oncheck" data-solution-timer-badge="off" -->
9 + 6 = [[ 15 ]]

### Manual start button (`onclick`)

          --{{0}}--
The check button is hidden until the learner clicks the start button. This prevents learners from checking the answer without committing to the timer.

``` markdown
<!-- data-solution-timer="10s" data-solution-timer-start="onclick" -->
9 + 6 = [[ 15 ]]
```

---

<!-- data-solution-timer="10s" data-solution-timer-start="onclick" -->
9 + 6 = [[ 15 ]]

### Manual start without badge

``` markdown
<!-- data-solution-timer="10s" data-solution-timer-start="onclick" data-solution-timer-badge="off" -->
5 + 5 = [[ 10 ]]
```

---

<!-- data-solution-timer="10s" data-solution-timer-start="onclick" data-solution-timer-badge="off" -->
5 + 5 = [[ 10 ]]

## Time format

The `data-solution-timer` value accepts several formats:

<!-- data-type="none" -->
| Format | Example | Meaning |
|---|---|---|
| Bare number | `90` | 90 seconds |
| Seconds unit | `30s`, `30sec` | 30 seconds |
| Minutes unit | `2min`, `2m` | 2 minutes |
| Hours unit | `1h`, `1hr` | 1 hour |
| Combined | `1min 30s` | 1 minute 30 seconds |
| `m:ss` | `1:30` | 1 minute 30 seconds |
| Milliseconds | `500ms` | 500 milliseconds |

## Implementation

          --{{0}}--
If you prefer not to use `import:`, copy the following block directly into the header of your LiaScript document.

``` markdown
script:   https://cdn.jsdelivr.net/gh/MINT-the-GAP/lia-timer@0.0.1/dist/index.js
```
