# Release procedure

> TODO Replace with GitHub Actions automation

1. Create Tags
2. Run build

    ```bash
    pnpm build --zip --target=chrome-mv3
    pnpm build --zip --target=firefox-mv3
    ````
3. Upload to Chrome, Firefox
