# ArtRental

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.0.

## Development and unit testing server

First edit both front end server files src/environments/environments.ts and src/environments/environment.development.ts to look like:

```bash
export const environment = {
  apiUrl: 'http://localhost:3000'
};
```

To start a local development and unit testing server, run:

```bash
ng serve
```

Or add an NPM script to package.json in the project root folder:

```bash
"start": "ng serve"
```

And to start the server via NPM, run:

```bash
npm run start
```

Configure and start the back end server per its README file.

Once the servers are running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files. You cannot browse the application from other devices on your network. To do so, see "Mobile amd LAN device access" below.

## Mobile and LAN device access

To start a local development server that can also be browsed by other devices on your LAN, including mobile devices, first identify the front end server's IPV4 address. In a Unix shell or Windows CMD window, run:

```bash
ipconfig
```

Locate the IPV4 address in the output.

Now edit src/environments/environment.development.ts to look like:

```bash
export const environment = {
  apiUrl: 'http://<server_IP_address>:3000'
};
```

You shouldn't need to make the same change to environment.ts, but you may want to try it if you run into problems seeing images on your mobile or other LAN device. Sometimes merely making the same change to environments.ts kicks things into place.

Add an NPM script to package.json in the project root folder:

```bash
"start:lan": "ng serve --host 0.0.0.0 --port 4200"
```

Then to start the server via NPM, run:

```bash
npm run start:lan
```

Configure and start the back end server per its README file.

Once the servers are running, open your browser and navigate to `http://<server_IP_address>:4200/`. The application will still automatically reload whenever you modify any of the source files. You can also browse the same address from other devices on your LAN. Note that you may need to make configuration changes on the LAN device to allow resources through to the device.

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

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

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
