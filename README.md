# Ooredoo MyFatoorah Google Pay Example

This React Native example reproduces the Ooredoo Kuwait Google Pay flow using
`myfatoorah-reactnative` **1.4.0** and manual payment execution.

The example is intended for **Android**. It initializes MyFatoorah in the Kuwait
test environment, creates a Google Pay request, opens the payment sheet, and
then executes the payment.

## Prerequisites

Install the following before running the project:

- Node.js **22.11.0 or newer**
- Yarn
- JDK 17
- Android Studio and the Android SDK
- An Android device, or an emulator image that includes Google Play services

Follow the React Native
[environment setup guide](https://reactnative.dev/docs/set-up-your-environment)
if Android development is not already configured on the machine.

## Required MyFatoorah configuration

> [!IMPORTANT]
> Before launching the app, replace **every placeholder** in
> [`src/MyFatoorahConfig.tsx`](src/MyFatoorahConfig.tsx). The example will not
> work with the values committed to this repository.

Update these three properties:

```ts
export class myFatoorahConfig {
  static apiKey = 'YOUR_MYFATOORAH_TEST_API_KEY';
  static merchantIdForGoogle = 'YOUR_GOOGLE_PAY_MERCHANT_ID';
  static sessionId = 'YOUR_FRESH_MYFATOORAH_SESSION_ID';
}
```

| Property | Required value |
| --- | --- |
| `apiKey` | A valid MyFatoorah **test** API key for Kuwait. |
| `merchantIdForGoogle` | The Google Pay merchant ID configured for this integration. |
| `sessionId` | A fresh session ID returned by the MyFatoorah Initiate Session API. The sample uses this value instead of calling the Ooredoo backend. |

The app currently calls `MFSDK.init` with `MFCountry.KUWAIT` and
`MFEnvironment.TEST` in `src/OoredooCode.tsx`. The API key and session ID must
belong to that same environment.

Do not commit real API keys or reusable credentials. Restore the placeholders
before sharing or committing the project.

## Install and launch

From the project root, install the JavaScript dependencies:

```sh
yarn install --frozen-lockfile
```

Start Metro in the first terminal:

```sh
yarn start
```

Keep Metro running. In a second terminal, build and launch the Android app:

```sh
yarn android
```

Alternatively, open the `android` directory in Android Studio and run the
`app` configuration after installing the JavaScript dependencies.

## Testing the payment flow

1. Confirm that the device or emulator has Google Play services and that a
   Google account is signed in.
2. Confirm that all properties in `src/MyFatoorahConfig.tsx` have been replaced.
3. Launch the app and tap **Pay with Google Pay**.
4. Review Metro and Logcat output for the session update, invoice ID, or SDK
   error details.

The implementation being tested is in `src/OoredooCode.tsx`. Its sequence is:

1. `MFSDK.init(...)`
2. `MFGPayButton.setupWithManualExecute(...)`
3. `MFGPayButton.openSheet()`
4. `MFGPayButton.executePayment(...)`

The sample currently renders the SDK's `MFGPayButton` off-screen and opens the
sheet from the visible **Pay with Google Pay** button. It was prepared to
investigate the Android SDK error:

```text
Error: Google Pay Launcher not configured
MFGPayModule.openSheet, error code 017
```

## Troubleshooting

Check the React Native environment first:

```sh
npx react-native doctor
```

If the Android build cache is stale, stop Metro and run:

```powershell
Set-Location android
.\gradlew.bat clean
Set-Location ..
yarn start --reset-cache
```

Then run `yarn android` again in a second terminal.

If Google Pay does not open, verify the MyFatoorah values again and test on a
Google Play-enabled Android device or emulator. A plain AOSP emulator does not
include the Google Play components required by Google Pay.
