# BankIssue

crm Accouunt 
userID/Email : CRM@EGYPTEXPRESS
password : CRM12345

-------------work 
prompit:--------
تمام عشان نكمل الشغل الي كما عملينه هديك الريكويست والريسبونس 
تغمل اللوحيك 
وهنعرض ف الكومبلين كل الكومبلينز معادا الي BANK REQUEST 
الي احنا غملينهاف ال update request 
اكيد فاكر وفاهم 
---------------------------------------------

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## BANKMISR proxy (IIS / Windows Server)

All browser API requests now use the site's own origin, for example:

- `/BANKMISR/login`
- `/BANKMISR/tracking`
- `/BANKMISR/reference-options`
- `/BANKMISR/complaints`

IIS forwards these requests internally using `public/web.config`. These are rewrites, not redirects. The upstream hostname is present only in server/development configuration, not in the Angular application source or production JavaScript. The existing request bodies and responses are preserved. This hides the upstream URL; SQL and credentials currently sent by the frontend remain visible in request bodies. Server-side authentication and credential storage are separate work.

### Local development

Run `npm start` (or `ng serve`) and open `http://localhost:4200`. `angular.json` loads `proxy.conf.cjs` automatically. Restart an existing development server after changing proxy configuration. No separate backend process is required locally.

### IIS deployment

1. Install **IIS URL Rewrite 2** and **Application Request Routing (ARR) 3** on the hosting server if they are not installed.
2. In IIS Manager, select the **server** > **Application Request Routing Cache** > **Server Proxy Settings** > enable **Enable proxy** > Apply. This is a server-level setting, not a setting in the site web.config. Keep upstream HTTPS certificate validation enabled.
3. Run `npm run build` and deploy the **contents** of `dist/BankIssue/browser` to the IIS website root, including `web.config`. Deploy this folder only; do not expose the repository, `proxy.conf.cjs`, or source files as website content.
4. Set the IIS site's default document to `index.html` (also configured in web.config). If the site already has a web.config, merge the BANKMISR rewrite rules above the Angular SPA fallback rule instead of replacing unrelated configuration.
5. Serve the website over HTTPS. The IIS server must have outbound HTTPS access to the upstream service configured in web.config.
6. Verify login, AWB/reference tracking, complaint lookup and complaint creation. The browser's request URL should use the site's domain followed by `/BANKMISR/...`. Directly refreshing `/home` or `/login` should still load Angular.

The configuration assumes the Angular application is hosted at the website root. Unknown BANKMISR paths and non-POST API requests return 404 instead of the Angular index page. IIS proxy behavior must be verified on the hosting server; an Angular build does not activate ARR.

Microsoft setup reference: https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing

Run the route/configuration checks with `npm run test:proxy`.
