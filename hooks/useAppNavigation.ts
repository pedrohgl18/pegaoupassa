import { useState } from 'react';
import { ScreenState } from '../types';

export const useAppNavigation = () => {
    const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.LOGIN);
    const [previousScreen, setPreviousScreen] = useState<ScreenState>(ScreenState.HOME);

    const navigateTo = (screen: ScreenState) => {
        setPreviousScreen(currentScreen);
        setCurrentScreen(screen);
    };

    const goBack = () => {
        setCurrentScreen(previousScreen);
    };

    return {
        currentScreen,
        previousScreen,
        navigateTo,
        goBack,
        setCurrentScreen, // Expose setter for flexibility
        setPreviousScreen,
    };
};
