import {world, system} from "@minecraft/server";

const obj = new Map();

system.run(() => {world.gameRules.naturalRegeneration = false;});
system.runInterval(() => {{for (const player of world.getPlayers()) healthSystem(player);}}, 1);

world.afterEvents.playerLeave.subscribe(event => {obj.delete(event.playerId);});

function healthSystem(player) {
    if (!player) return;

    const health = player.getComponent("minecraft:health");

    if (health.currentValue >= health.effectiveMax) return;

    const hunger = player.getComponent("minecraft:player.hunger");
    const saturation = player.getComponent("minecraft:player.saturation");
    const exhaustion = player.getComponent("minecraft:player.exhaustion");

    let struct = obj.get(player.id);

    if (!struct) {
        struct = {timer: 0};
        obj.set(player.id, struct);
    }

    struct.timer++;

    if (hunger.currentValue >= (hunger.effectiveMax - 2) && saturation.currentValue > 0 && struct.timer >= 20) {
        health.setCurrentValue(Math.min((health.currentValue + 1), health.effectiveMax));
        saturation.setCurrentValue(Math.max(0, (saturation.currentValue - 1)));
        exhaustion.setCurrentValue(Math.min((exhaustion.currentValue + 3), exhaustion.effectiveMax));

        struct.timer = 0;
        return;
    }

    if (hunger.currentValue >= (hunger.effectiveMax - 2) && saturation.currentValue <= 0 && struct.timer >= 80) {
        health.setCurrentValue(Math.min((health.currentValue + 1), health.effectiveMax));
        saturation.setCurrentValue(Math.max(0, (saturation.currentValue - 1)));
        exhaustion.setCurrentValue(Math.min((exhaustion.currentValue + 3), exhaustion.effectiveMax));

        struct.timer = 0;
    }
}
