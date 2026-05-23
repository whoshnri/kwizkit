---
name: pencil-design
description: 'Create websites, app screens, dashboards, slides, marketing materials, social graphics, mockups, wireframes, and other visuals with the Pencil CLI. Use when the user wants to design, generate, visualize, or iterate on any UI, layout, presentation, or marketing asset.'
argument-hint: 'What should Pencil design?'
user-invocable: true
disable-model-invocation: false
---

# Pencil Design

Create professional visual designs from a natural language prompt using the Pencil CLI. Pencil generates `.pen` files and can export rendered images for review.

## When to Use

Use this skill when the user wants to:

- Design a website, landing page, app screen, dashboard, slide, poster, banner, or social graphic
- Create a mockup, wireframe, or visual concept from an idea
- Iterate on an existing Pencil design
- See what a product, feature, or layout would look like before implementation

## Core Rules

- Pass the user's request directly to Pencil as the prompt.
- Do not add your own layout, color, typography, or content directions unless the user asked for them.
- Save outputs in the current workspace or a `designs/` subfolder so the user can find them later.
- Always export an image and show it after generation.
- Use `--export-scale 2` for crisp output.

## Workflow

1. Check that the Pencil CLI is available.
   - Run `which pencil || npx pencil version`.
2. Check authentication status.
   - Run `pencil status`.
3. If Pencil is not installed, install it.
   - Try `npm install -g @pencil.dev/cli`.
   - If global install is not possible, use `npm install @pencil.dev/cli` and run it with `npx pencil`.
4. If authentication is missing, help the user log in or sign up.
   - `pencil signup --email you@example.com --username johndoe --name "John Doe"`
   - `pencil login --email you@example.com [--code abc123]`
   - If `PENCIL_CLI_KEY` is available, use that instead.
5. Generate the design.
   - Use the user's request as the prompt.
   - Save the `.pen` file with `--out` and export a rendered image with `--export`.
6. Review the exported image.
   - Open the exported PNG after generation.
7. Iterate if needed.
   - Re-run Pencil with `--in <previous.pen>` and a focused edit prompt.

## Standard Command

```bash
pencil --out designs/design.pen --prompt "<user request>" --export designs/design.png --export-scale 2
```

## Iteration Pattern

Use the previous `.pen` file when the user wants changes.

```bash
pencil --in designs/design.pen --out designs/design-v2.pen --prompt "<requested change>" --export designs/design-v2.png --export-scale 2
```

## Validation Checklist

- The `.pen` file was created in a workspace-visible location.
- The exported image exists and can be reviewed.
- The design matches the user's request without unnecessary invention.
- If the user asked for changes, the next iteration starts from the previous `.pen` file.

## Troubleshooting

- If Pencil is missing, install it and re-run the version check.
- If authentication fails, ask the user to sign in with `pencil login` or provide a `PENCIL_CLI_KEY`.
- If rendering looks off, iterate from the existing `.pen` file instead of starting over.