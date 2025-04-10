import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * ToxicityIndicator component displays toxicity level of mushrooms using colored dots
 * @param {string} toxicity_level - Toxicity level ("low", "medium", or "high")
 * @returns JSX element with appropriate toxicity indicator
 */
const ToxicityIndicator = ({ toxicity_level }) => {
    if (!toxicity_level) return null;

    switch (toxicity_level.toLowerCase()) {
        case 'low':
            return (
                <View style={styles.container}>
                    <View style={[styles.dot, styles.filledLow, styles.dotWithMargin]} />
                    <View style={[styles.dot, styles.outlineLow, styles.dotWithMargin]} />
                    <View style={[styles.dot, styles.outlineLow]} />
                </View>
            );

        case 'medium':
            return (
                <View style={styles.container}>
                    <View style={[styles.dot, styles.filledMedium, styles.dotWithMargin]} />
                    <View style={[styles.dot, styles.filledMedium, styles.dotWithMargin]} />
                    <View style={[styles.dot, styles.outlineMedium]} />
                </View>
            );

        case 'high':
            return (
                <View style={styles.container}>
                    <View style={[styles.dot, styles.filledHigh, styles.dotWithMargin]} />
                    <View style={[styles.dot, styles.filledHigh, styles.dotWithMargin]} />
                    <View style={[styles.dot, styles.filledHigh]} />
                </View>
            );

        default:
            return null;
    }
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 8,
        borderRadius: 5,
    },
    dotWithMargin: {
        marginRight: 2,
    },
    // Low toxicity styles (green)
    filledLow: {
        backgroundColor: '#6af177',
    },
    outlineLow: {
        borderWidth: 1,
        borderColor: '#6af177',
    },
    // Medium toxicity styles (yellow)
    filledMedium: {
        backgroundColor: '#ffe74d',
    },
    outlineMedium: {
        borderWidth: 1,
        borderColor: '#ffe74d',
    },
    // High toxicity styles (red)
    filledHigh: {
        backgroundColor: '#ff5762',
    },
    outlineHigh: {
        borderWidth: 1,
        borderColor: '#ff5762',
    },
});

export default ToxicityIndicator;