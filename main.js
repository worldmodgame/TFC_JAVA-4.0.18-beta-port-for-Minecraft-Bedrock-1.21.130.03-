import { world, system } from "@minecraft/server";

// Сохраняем оригинальную логику тиков TFC 4.0.18
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const dimension = player.dimension;
        const pos = player.location;
        
        // Логика TFC: проверка температуры биома и высоты
        // 1.21.130 требует явного указания измерения для query
        const temperature = dimension.getBiomeMaxTemperatureAt(pos);
        
        // Здесь должен быть твой вызов функций обработки еды и жажды
        // updatePlayerTFCStats(player, temperature);
    }
}, 20); // 1 раз в секунду (20 тиков)
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";

function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    let currentSeason = "Unknown";
    if (TFC_CALENDAR_SETTINGS.SEASONS.SPRING.includes(monthIndex)) currentSeason = "Spring";
    else if (TFC_CALENDAR_SETTINGS.SEASONS.SUMMER.includes(monthIndex)) currentSeason = "Summer";
    else if (TFC_CALENDAR_SETTINGS.SEASONS.AUTUMN.includes(monthIndex)) currentSeason = "Autumn";
    else if (TFC_CALENDAR_SETTINGS.SEASONS.WINTER.includes(monthIndex)) currentSeason = "Winter";

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays
    };
}

// Обновление состояния мира каждую секунду
system.runInterval(() => {
    const tfcDate = getTFCTime();
    
    // Вывод даты в Actionbar для отладки (можно потом скрыть)
    for (const player of world.getAllPlayers()) {
        player.onScreenDisplay.setActionBar(
            `§6${tfcDate.day} ${tfcDate.month}, Year ${tfcDate.year} (§b${tfcDate.season}§r)`
        );
        
        // Логика TFC: Влияние сезона на игрока (например, холод зимой)
        if (tfcDate.season === "Winter") {
            // Здесь будет код проверки теплоты одежды и костров
        }
    }
}, 20);

export { getTFCTime };

import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";

function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    let currentSeason = "Unknown";
    if (TFC_CALENDAR_SETTINGS.SEASONS.SPRING.includes(monthIndex)) currentSeason = "Spring";
    else if (TFC_CALENDAR_SETTINGS.SEASONS.SUMMER.includes(monthIndex)) currentSeason = "Summer";
    else if (TFC_CALENDAR_SETTINGS.SEASONS.AUTUMN.includes(monthIndex)) currentSeason = "Autumn";
    else if (TFC_CALENDAR_SETTINGS.SEASONS.WINTER.includes(monthIndex)) currentSeason = "Winter";

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays
    };
}

// Глобальный цикл обновлений
system.runInterval(() => {
    const tfcDate = getTFCTime();
    
    for (const player of world.getAllPlayers()) {
        // 1. Отображение календаря
        player.onScreenDisplay.setActionBar(
            `§6${tfcDate.day} ${tfcDate.month}, Year ${tfcDate.year} (§b${tfcDate.season}§r)`
        );
        
        // 2. Система порчи еды (проверка раз в 10 секунд для оптимизации 1.21.130)
        if (system.currentTick % 200 === 0) {
            updateFoodDecay(player);
        }
    }
}, 20);

export { getTFCTime };
import "./tfc_panning_engine.js"; 
// Остальной код (календарь, порча еды и т.д.)
// ... внутри system.runInterval ...
const tfcDate = getTFCTime();
const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;

for (const player of world.getAllPlayers()) {
    player.onScreenDisplay.setActionBar({
        rawtext: [
            { text: `§6${tfcDate.day} ` },
            { text: `${tfcDate.month}, Year ${tfcDate.year} (` },
            { translate: seasonKey },
            { text: `)§r` }
        ]
    });
}
import { world, system } from "@minecraft/server";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        // Обновляем еду раз в 200 тиков
        if (system.currentTick % 200 === 0) {
            updateFoodDecay(player);
        }

        // Обновляем температуру предметов раз в 20 тиков (каждую секунду)
        if (system.currentTick % 20 === 0) {
            updateItemHeat(player);
        }
    }
}, 1);
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";

/**
 * Расчет времени в формате TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays
    };
}

/**
 * Глобальный цикл обновлений (Оптимизирован под 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        // 1. HUD Календаря (Локализованный)
        player.onScreenDisplay.setActionBar({
            rawtext: [
                { text: `§6${tfcDate.day} ` },
                { text: `${tfcDate.month}, Year ${tfcDate.year} (` },
                { translate: seasonKey },
                { text: `)§r` }
            ]
        });

        // 2. Система порчи еды (каждые 10 секунд / 200 тиков)
        if (currentTick % 200 === 0) {
            updateFoodDecay(player);
        }

        // 3. Система нагрева предметов (каждую секунду / 20 тиков)
        if (currentTick % 20 === 0) {
            updateItemHeat(player);
        }
    }
}, 1);

console.warn("TFC Java 4.0.18 Port: All systems initialized for 1.21.130.03");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";

/**
 * Расчет времени и сезонов TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays,
        monthIndex: monthIndex
    };
}

/**
 * Глобальный цикл обновлений (Оптимизирован под 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        // 1. Календарь в ActionBar
        player.onScreenDisplay.setActionBar({
            rawtext: [
                { text: `§6${tfcDate.day} ` },
                { text: `${tfcDate.month}, Year ${tfcDate.year} (` },
                { translate: seasonKey },
                { text: `)§r` }
            ]
        });

        // 2. Порча еды (раз в 10 секунд)
        if (currentTick % 200 === 0) {
            updateFoodDecay(player);
        }

        // 3. Нагрев предметов (раз в секунду)
        if (currentTick % 20 === 0) {
            updateItemHeat(player);
        }

        // 4. Проверка роста растений (раз в 30 секунд для экономии ресурсов)
        if (currentTick % 600 === 0) {
            updateCropsLogic();
        }
    }
}, 1);

console.warn("TFC Java 4.0.18 Port: All systems (Calendar, Heat, Food, Anvil, Fire, Crops) initialized.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";

/**
 * Расчет времени и сезонов TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays,
        monthIndex: monthIndex
    };
}

/**
 * Глобальный цикл обновлений (Оптимизирован под 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirstLevel = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // 1. HUD Календаря и Жажды (Локализованный)
        player.onScreenDisplay.setActionBar({
            rawtext: [
                { text: `§6${tfcDate.day} ${tfcDate.month} (§b` },
                { translate: seasonKey },
                { text: `§6) | ` },
                { translate: "tfc.thirst.status", with: [thirstLevel.toString()] }
            ]
        });

        // 2. Система жажды (каждый тик для плавного расхода)
        updateThirstLogic(player);

        // 3. Порча еды (раз в 10 секунд)
        if (currentTick % 200 === 0) {
            updateFoodDecay(player);
        }

        // 4. Нагрев предметов (раз в секунду)
        if (currentTick % 20 === 0) {
            updateItemHeat(player);
        }

        // 5. Проверка роста растений (раз в 30 секунд)
        if (currentTick % 600 === 0) {
            updateCropsLogic();
        }
    }
}, 1);

console.warn("TFC Java 4.0.18 Port: Integrated Thirst System with Calendar and Heat engine.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";

/**
 * Расчет времени и сезонов TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays,
        monthIndex: monthIndex
    };
}

/**
 * Глобальный цикл обновлений (Оптимизирован под 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirstLevel = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // 1. HUD: Календарь + Жажда
        player.onScreenDisplay.setActionBar({
            rawtext: [
                { text: `§6${tfcDate.day} ${tfcDate.month} (` },
                { translate: seasonKey },
                { text: `) | ` },
                { translate: "tfc.thirst.status", with: [thirstLevel.toString()] }
            ]
        });

        // 2. Жажда (каждый тик)
        updateThirstLogic(player);

        // 3. Еда (раз в 10 сек)
        if (currentTick % 200 === 0) updateFoodDecay(player);

        // 4. Нагрев предметов (раз в сек)
        if (currentTick % 20 === 0) updateItemHeat(player);

        // 5. Рост растений (раз в 30 сек)
        if (currentTick % 600 === 0) updateCropsLogic();
    }
}, 1);

console.warn("TFC Java 4.0.18 Port: All core mechanics (including Tree Felling) are active.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import { openKnappingUI } from "./tfc_ui_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";
import "./tfc_ui_engine.js";

/**
 * Расчет времени и сезонов TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays,
        monthIndex: monthIndex
    };
}

/**
 * Глобальный цикл обновлений (Оптимизирован под 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirstLevel = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // HUD: Календарь + Жажда
        player.onScreenDisplay.setActionBar({
            rawtext: [
                { text: `§6${tfcDate.day} ${tfcDate.month} (` },
                { translate: seasonKey },
                { text: `) | ` },
                { translate: "tfc.thirst.status", with: [thirstLevel.toString()] }
            ]
        });

        // Основные механики
        updateThirstLogic(player);
        if (currentTick % 200 === 0) updateFoodDecay(player);
        if (currentTick % 20 === 0) updateItemHeat(player);
        if (currentTick % 600 === 0) updateCropsLogic();

        // Механика Knapping (открытие по нажатию Shift + Использование камня)
        if (player.isSneaking && currentTick % 10 === 0) {
            const item = player.getComponent("inventory").container.getItem(player.selectedSlotIndex);
            if (item?.typeId === "tfc:rock/loose") {
                openKnappingUI(player);
            }
        }
    }
}, 1);

console.warn("TFC Java 4.0.18 Port: All modules and UI Engine loaded.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import { openKnappingUI } from "./tfc_knapping_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";

export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;
    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    return { day: dayOfMonth, month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex], year: year, season: seasonMap[monthIndex], totalDays: totalDays };
}

system.runInterval(() => {
    const tfcDate = getTFCTime();
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirst = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        player.onScreenDisplay.setActionBar(`§6${tfcDate.day} ${tfcDate.month} | §bЖажда: ${thirst}%`);

        updateThirstLogic(player);
        if (currentTick % 200 === 0) updateFoodDecay(player);
        if (currentTick % 20 === 0) updateItemHeat(player);
        if (currentTick % 600 === 0) updateCropsLogic();

        // Активация Knapping: 2 камня в руках + Shift + ПКМ (использование)
        const inventory = player.getComponent("inventory").container;
        const mainHand = inventory.getItem(player.selectedSlotIndex);
        
        if (player.isSneaking && mainHand?.hasTag("tfc:rock")) {
            // В Bedrock мы открываем UI через проверку состояния, так как itemUse на 2 камня может не сработать
            if (currentTick % 10 === 0) { // Защита от спама окнами
                 // openKnappingUI(player, mainHand.typeId); 
                 // Вызов перенесен в world.beforeEvents для стабильности
            }
        }
    }
}, 1);

world.beforeEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;
    if (player.isSneaking && itemStack.hasTag("tfc:rock")) {
        system.run(() => openKnappingUI(player, itemStack.typeId));
    }
});

console.warn("TFC: Knapping System (5x5 Matrix) Loaded.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import { updateLivestock } from "./tfc_livestock_engine.js";
import { openKnappingUI } from "./tfc_knapping_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";

// ... (getTFCTime функция остается без изменений) ...
export function getTFCTime() { /* Код функции getTFCTime */ }

/**
 * Глобальный цикл обновлений (Оптимизирован под 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirst = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // HUD: Календарь + Жажда
        player.onScreenDisplay.setActionBar({
            rawtext: }
            ]
        });

        // Основные механики
        updateThirstLogic(player);
        if (currentTick % 200 === 0) updateFoodDecay(player);
        if (currentTick % 20 === 0) updateItemHeat(player);
        if (currentTick % 600 === 0) updateCropsLogic();
    }
    
    // Обновление животных (раз в минуту игрового времени)
    if (currentTick % 1200 === 0) {
        updateLivestock();
    }

}, 1);

// Активация Knapping через beforeEvents.itemUse
world.beforeEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;
    if (player.isSneaking && itemStack.hasTag("tfc:rock")) {
        system.run(() => openKnappingUI(player, itemStack.typeId));
    }
});

console.warn("TFC Java 4.0.18 Port: All core mechanics (including Livestock and Knapping) are active.");
Use code with caution.
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import { updateLivestock } from "./tfc_livestock_engine.js";
import { openKnappingUI } from "./tfc_knapping_engine.js";
import { checkForAlloy } from "./tfc_alloy_engine.js"; // Інтеграція двигуна сплавів
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";
import "./tfc_ui_engine.js";

// ... (getTFCTime функція залишається без змін) ...
export function getTFCTime() { /* Код функції getTFCTime */ }

/**
 * Глобальний цикл обновлений (Оптимізовано під 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirst = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // HUD: Календарь + Жажда
        player.onScreenDisplay.setActionBar({
            rawtext: }]
        });

        // Основные механики
        updateThirstLogic(player);
        if (currentTick % 200 === 0) updateFoodDecay(player);
        if (currentTick % 20 === 0) updateItemHeat(player);
        if (currentTick % 600 === 0) updateCropsLogic();
    }
    
    if (currentTick % 1200 === 0) updateLivestock();
}, 1);

// Активація Knapping через beforeEvents.itemUse
world.beforeEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;
    if (player.isSneaking && itemStack.hasTag("tfc:rock")) {
        system.run(() => openKnappingUI(player, itemStack.typeId));
    }
});

console.warn("TFC Java 4.0.18 Port: Alloy System integrated and active.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic } from "./tfc_crops_engine.js";
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import { updateLivestock } from "./tfc_livestock_engine.js";
import { updatePlayerClimate } from "./tfc_climate_engine.js"; // Інтеграція клімату
import { openKnappingUI } from "./tfc_knapping_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";
import "./tfc_ui_engine.js";

/**
 * Расчет времени и сезонов TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays,
        monthIndex: monthIndex
    };
}

/**
 * Глобальный цикл обновлений (Оптимізовано під 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirst = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // 1. HUD: Календарь + Жажда
        player.onScreenDisplay.setActionBar({
            rawtext: }]
        });

        // 2. Система клімату та температури тіла (оновлюється постійно)
        updatePlayerClimate(player);

        // 3. Основні механіки з інтервалом
        updateThirstLogic(player);
        if (currentTick % 200 === 0) updateFoodDecay(player); // 10 сек
        if (currentTick % 20 === 0) updateItemHeat(player);   // 1 сек
        if (currentTick % 600 === 0) updateCropsLogic();     // 30 сек
    }
    
    if (currentTick % 1200 === 0) updateLivestock(); // 1 хв
}, 1);

// Активація Knapping через beforeEvents.itemUse
world.beforeEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;
    if (player.isSneaking && itemStack.hasTag("tfc:rock")) {
        system.run(() => openKnappingUI(player, itemStack.typeId));
    }
});

console.warn("TFC Java 4.0.18 Port: All core systems and climate engine are active.");
import { world, system } from "@minecraft/server";
import { TFC_CALENDAR_SETTINGS } from "./tfc_calendar_config.js";
import { updateFoodDecay } from "./tfc_food_engine.js";
import { updateItemHeat } from "./tfc_heat_engine.js";
import { updateCropsLogic, updateFarmingLogic } from "./tfc_farming_engine.js"; // Додано updateFarmingLogic
import { updateThirstLogic } from "./tfc_thirst_engine.js";
import { updateLivestock } from "./tfc_livestock_engine.js";
import { updatePlayerClimate } from "./tfc_climate_engine.js";
import { openKnappingUI } from "./tfc_knapping_engine.js";
import "./tfc_panning_engine.js";
import "./tfc_anvil_engine.js";
import "./tfc_fire_engine.js";
import "./tfc_trees_engine.js";
import "./tfc_ui_engine.js";

/**
 * Расчет времени и сезонов TFC Java 4.0.18
 */
export function getTFCTime() {
    const absoluteTime = world.getAbsoluteTime();
    const totalDays = Math.floor(absoluteTime / TFC_CALENDAR_SETTINGS.TICKS_PER_DAY);
    const dayOfYear = totalDays % (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR);
    const monthIndex = Math.floor(dayOfYear / TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH);
    const dayOfMonth = (dayOfYear % TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH) + 1;
    const year = Math.floor(totalDays / (TFC_CALENDAR_SETTINGS.DAYS_IN_MONTH * TFC_CALENDAR_SETTINGS.MONTHS_IN_YEAR)) + 1000;

    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    const currentSeason = seasonMap[monthIndex];

    return {
        day: dayOfMonth,
        month: TFC_CALENDAR_SETTINGS.MONTH_NAMES[monthIndex],
        year: year,
        season: currentSeason,
        totalDays: totalDays,
        monthIndex: monthIndex
    };
}

/**
 * Глобальний цикл обновлений (Оптимізовано під 1.21.130.03)
 */
system.runInterval(() => {
    const tfcDate = getTFCTime();
    const seasonKey = `tfc.enum.season.${tfcDate.season.toLowerCase()}`;
    const currentTick = system.currentTick;

    for (const player of world.getAllPlayers()) {
        const thirst = Math.floor(player.getDynamicProperty("tfc:thirst_level") ?? 100);
        
        // 1. HUD: Календарь + Жажда
        player.onScreenDisplay.setActionBar({
            rawtext: }]
        });

        // 2. Система клімату та температури тіла
        updatePlayerClimate(player);

        // 3. Основні механіки з інтервалом
        updateThirstLogic(player);
        if (currentTick % 200 === 0) updateFoodDecay(player); // 10 сек
        if (currentTick % 20 === 0) updateItemHeat(player);   // 1 сек
        if (currentTick % 600 === 0) {
            updateCropsLogic();     // 30 сек (Wild Crops)
            updateFarmingLogic();   // 30 сек (Farmed Crops/Soil Decay)
        }
    }
    
    if (currentTick % 1200 === 0) updateLivestock(); // 1 хв
}, 1);

// Активація Knapping через beforeEvents.itemUse
world.beforeEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;
    if (player.isSneaking && itemStack.hasTag("tfc:rock")) {
        system.run(() => openKnappingUI(player, itemStack.typeId));
    }
});

console.warn("TFC Java 4.0.18 Port: All core systems (including Farming and Soil Fertility) are active.");