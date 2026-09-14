/**
 * MyFatoorah Google Pay – dummy React Native component (for verification)
 *
 * App      : Ooredoo Kuwait MyOoredoo
 * SDK      : myfatoorah-reactnative 1.4.0
 * Platform : Android
 * Country  : Kuwait
 * Currency : KWD
 * Mode     : MFEnvironment.TEST (non-prod) / MFEnvironment.LIVE (prod)
 *
 * FLOW
 * ----
 * 1. Component mount
 *      → useEffect → MFSDK.init(apiKey, KUWAIT, TEST|LIVE)
 *
 * 2. User taps Pay
 *      → initiateSessionForMyFatoorah()
 *      → Internal API: INITIATE_SESSION
 *      → returns sessionId
 *
 * 3. setupGPWithManualExecute(sessionId, amount)
 *      → MFGPayButton.setupWithManualExecute(sessionId, MFGooglePayRequest)
 *      → MFGPayButton.openSheet()
 *      → onSessionUpdated(updatedSessionId)
 *
 * 4. executeGooglePayPayment(updatedSessionId, amount)
 *      → MFGPayButton.executePayment(MFExecutePaymentRequest)
 *
 * 5. Internal fulfillment API
 *      → onClickContinue()
 *      → bill / recharge / purchase APIs
 *
 * ERROR ON ANDROID EMULATOR
 * -------------------------
 * openSheet() throws:
 *   error : 5  Error: Google Pay Launcher not configured
 * (myfatoorah-reactnative MFGPayModule.openSheet, error code 017)
 *
 * Please confirm:
 * 1. Is setupWithManualExecute + openSheet the correct sequence for RN 1.4.0?
 * 2. Must MFGPayButton be visible / on-screen (not hidden) for the launcher?
 * 3. Any extra Android setup so MFGooglePayLauncher is registered before openSheet()?
 * 4. Is merchantId the Google Pay merchant ID from Google Pay & Wallet Console?
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Platform,
    processColor,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
} from 'react-native';
import {
    MFCountry,
    MFCurrencyISO,
    MFEnvironment,
    MFExecutePaymentRequest,
    MFGPayButton,
    MFLanguage,
    MFGooglePayRequest,
    MFSDK,
} from 'myfatoorah-reactnative';
import { myFatoorahConfig } from './MyFatoorahConfig';

const ISENVIRONMENT = 'TEST';
const PRODUCTION = 'PRODUCTION';

const MyFatoorahGooglePayImplementation = () => {
    const manualExecuteGPButtonRef = useRef(null);
    const tokenization = useRef({});
    const applePaymentData = useRef({});

    const [buttonLoader, setButtonLoader] = useState(false);
    const [paymentAmount] = useState(1.0);

    // ===========================================================================
    // STEP 1 – SDK init on component mount
    // Source: src/pages/rewamp/HomeOnApp/HomeOnApp.js
    // ===========================================================================
    useEffect(() => {
        const initialize = async () => {
            await configure();
            await setUpActionBar();
        };
        initialize();
    }, []);

    const configure = async () => {
        await MFSDK.init(
            myFatoorahConfig.apiKey,
            MFCountry.KUWAIT,
            ISENVIRONMENT === PRODUCTION ? MFEnvironment.LIVE : MFEnvironment.TEST
        );
    };

    const setUpActionBar = async () => {
        await MFSDK.setUpActionBar(
            'Company Payment',
            processColor('#FFFFFF'),
            processColor('#000000'),
            true
        );
    };

    // ===========================================================================
    // STEP 2 – On Pay button click → initiate session, then Google Pay
    // Source: NewPaymentBottomSheet.js
    // After INITIATE_SESSION success (status === '0'),
    // res.response is the MyFatoorah sessionId.
    // ===========================================================================
    const onPayPress = async () => {
        setButtonLoader(true);
        await initiateSessionForMyFatoorah(paymentAmount);
    };

    const initiateSessionForMyFatoorah = async amount => {
        // Dummy stand-in for our internal INITIATE_SESSION API.
        // In the app: commonAPICallAction('', INITIATE_SESSION, payload)
        const sessionId = 'DUMMY_SESSION_ID_FROM_INITIATE_SESSION';
        onInitiateSessionSuccess(sessionId, amount);
    };

    const onInitiateSessionSuccess = (sessionId, amount) => {
        setupGPWithManualExecute(sessionId, amount);
    };

    // ===========================================================================
    // STEP 3 – setupGPWithManualExecute
    // Source: NewPaymentBottomSheet.js (lines 428-476)
    // 1. Build MFGooglePayRequest
    // 2. setupWithManualExecute(sessionId, request, onSessionUpdated, onError)
    // 3. openSheet()
    // 4. onSessionUpdated → executeGooglePayPayment
    // ===========================================================================
    const setupGPWithManualExecute = async (sessionId, amount) => {
        const request = new MFGooglePayRequest(
            amount.toString(),
            myFatoorahConfig.merchantIdForGoogle,
            'Test Vendor',
            MFCountry.KUWAIT,
            MFCurrencyISO.KUWAIT_KWD
        );

        try {
            if (!manualExecuteGPButtonRef.current) {
                throw new Error('Google Pay button is not ready');
            }

            await manualExecuteGPButtonRef.current?.setupWithManualExecute(
                sessionId,
                request,
                updatedSessionId => {
                    console.log('sessionId: ' + updatedSessionId);
                    executeGooglePayPayment(updatedSessionId || sessionId, amount);
                },
                error => {
                    console.log('error : 4 ', error);
                    setButtonLoader(false);
                }
            );
            await manualExecuteGPButtonRef.current?.openSheet();
        } catch (error) {
            console.log('error : 5 ', error);
            setButtonLoader(false);
        }
    };

    // ===========================================================================
    // STEP 4 – executeGooglePayPayment
    // Source: NewPaymentBottomSheet.js (lines 478-513)
    // After Google Pay updates the session, execute payment on MyFatoorah.
    // On success → Step 5 internal API (onClickContinue).
    // ===========================================================================
    const executeGooglePayPayment = async (sessionId, amount) => {
        const executePaymentRequest = new MFExecutePaymentRequest(amount);
        executePaymentRequest.SessionId = sessionId;

        try {
            await manualExecuteGPButtonRef.current?.executePayment(
                executePaymentRequest,
                MFLanguage.ARABIC,
                invoiceId => console.log('invoiceId : ' + invoiceId)
            );

            applePaymentData.current = {
                id: sessionId,
            };
            tokenization.current = {
                token: sessionId,
            };
            setTimeout(() => {
                setButtonLoader(true);
                onClickContinue();
            }, 200);
        } catch (error) {
            console.log('error : 3 ', error);
            setButtonLoader(false);
        }
    };

    // ===========================================================================
    // STEP 5 – Internal API after MyFatoorah success
    // onClickContinue() is our existing fulfillment layer (not MyFatoorah).
    // Depending on journey it calls bill / recharge / purchase APIs.
    // Those APIs receive the MyFatoorah session / token stored in
    // tokenization.current and applePaymentData.current.
    // ===========================================================================
    const onClickContinue = () => {
        // Internal bill / recharge / purchase APIs
        console.log('Internal API with token:', tokenization.current);
        setButtonLoader(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.payButton}
                onPress={onPayPress}
                disabled={buttonLoader}>
                <Text style={styles.payButtonText}>
                    {buttonLoader ? 'Please wait...' : 'Pay with Google Pay'}
                </Text>
            </TouchableOpacity>

            {/*
        Hidden MFGPayButton (required by the SDK).
        Triggered programmatically via openSheet(), not by a visible button click.
      */}
            {Platform.OS === 'android' && (
                <View pointerEvents="none" style={styles.hiddenGooglePayWrapper}>
                    <MFGPayButton
                        ref={manualExecuteGPButtonRef}
                        style={styles.hiddenGooglePayButton}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    payButton: {
        height: 50,
        borderRadius: 8,
        backgroundColor: '#E40521',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    hiddenGooglePayWrapper: {
        position: 'absolute',
        width: 1,
        height: 1,
        left: -1000,
        top: -1000,
        opacity: 0,
        overflow: 'hidden',
    },
    hiddenGooglePayButton: {
        width: 1,
        height: 1,
    },
});

export default MyFatoorahGooglePayImplementation;
