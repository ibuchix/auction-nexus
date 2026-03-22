

# Fix React Router XSS via Open Redirects (Dependabot Alert #22)

## Risk Assessment

`@remix-run/router 1.20.0` is a transitive dependency via `react-router-dom 6.27.0`. The vulnerability allows XSS via open redirects in loader/action redirects — but only if your code creates redirect paths from untrusted user input. Your app uses static redirect paths (e.g., `<Navigate to="/" replace />`), so **practical risk is low** but worth patching.

## Fix

Add `@remix-run/router` to the existing `overrides` block in `package.json`:

```json
"overrides": {
  "rollup": ">=4.59.0",
  "flatted": ">=3.4.2",
  "minimatch": ">=9.0.7",
  "@remix-run/router": ">=1.23.2"
}
```

## What changes

- `package.json`: Add 1 line to `overrides`
- No code or behavior changes

