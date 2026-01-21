// https://github.com/xeirh

import { world, system } from "@minecraft/server";

const object = new Map();

//
system.run(() => {
    try {
        world.gameRules.naturalRegeneration = false;
    } catch (param) {
        console.warn("Failure:", param);
    }
});

//
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        try {
            naturalRegeneration(player);
        } catch (param) {
            console.warn(`Failure Interval: ${player.name}`, param);
        }
    }
}, 1);

//
function naturalRegeneration(player) {
    if (!player) return;

    const health = player.getComponent("minecraft:health");
    const hunger = player.getComponent("minecraft:player.hunger");

    if (health.currentValue >= health.effectiveMax) return;

    const saturation = player.getComponent("minecraft:player.saturation");
    const exhaustion = player.getComponent("minecraft:player.exhaustion");

    let current = object.get(player.id);

    if (!current) {
        current = {ticking: 0};
        object.set(player.id, current);
    }

    current.ticking++;

    if (hunger.currentValue >= (hunger.effectiveMax - 2) && saturation.currentValue > 0 && current.ticking >= 20) {
        health.setCurrentValue(Math.min((health.currentValue + 1), health.effectiveMax));
        saturation.setCurrentValue(Math.max(0, (saturation.currentValue - 1)));
        exhaustion.setCurrentValue(Math.min((exhaustion.currentValue + 3), exhaustion.effectiveMax));

        current.ticking = 0;
        return;
    }

    if (hunger.currentValue >= (hunger.effectiveMax - 2) && saturation.currentValue <= 0 && current.ticking >= 80) {
        health.setCurrentValue(Math.min((health.currentValue + 1), health.effectiveMax));
        saturation.setCurrentValue(Math.max(0, (saturation.currentValue - 1)));
        exhaustion.setCurrentValue(Math.min((exhaustion.currentValue + 3), exhaustion.effectiveMax));

        current.ticking = 0;
    }
}

//
world.afterEvents.playerLeave.subscribe(event => {
    object.delete(event.playerId);
});
