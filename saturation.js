import {world, system} from "@minecraft/server";

const object = new Map();

system.run(() => {world.gameRules.naturalRegeneration = false;});
system.runInterval(() => {{for (const player of world.getPlayers()) healthSystem(player);}}, 1);

world.afterEvents.playerLeave.subscribe(event => {object.delete(event.playerId);});

function healthSystem(player)
{
    if (!player) return;

    const health = player.getComponent( "minecraft:health" );

    if (health.currentValue >= health.effectiveMax) return;

    // minecraft:food is the newer component, but it's not invited to sit at the cool kids' table with me.
    const hunger = player.getComponent("minecraft:player.hunger");
    const saturation = player.getComponent("minecraft:player.saturation");

    let session = object.get(player.id);

    if (!session) {
        session = {tick: 0};
        object.set(player.id, session);
    }

    session.tick++;

    if (hunger.currentValue >= hunger.effectiveMax && saturation.currentValue >= 1 && session.tick >= 10) {
        health.setCurrentValue(Math.min((health.currentValue + 1), health.effectiveMax));
        saturation.setCurrentValue(Math.max(0, (saturation.currentValue - 1)));

        session.tick = 0;
        return;
    }

    if (hunger.currentValue >= (hunger.effectiveMax - 2) && session.tick >= 80) {
        health.setCurrentValue(Math.min((health.currentValue + 1), health.effectiveMax));
        hunger.setCurrentValue(Math.max(0, (hunger.currentValue - 1)));

        session.tick = 0;
    }
}