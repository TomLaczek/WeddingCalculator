export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";
export type DiscoutType = "PhotographyAndVideo" | "WeddingSession" | "WeddingSession2020";
interface DiscountInterface{
    discount: DiscoutType,
    amount: number
};

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    switch (action.type) {
        case "Deselect":
            const deselectState = [...previouslySelectedServices];

            const newState = deselectState.filter(x => x != action.service);
            const deselectBlurayVerifire = action.service === "VideoRecording" && newState.includes("BlurayPackage");
            const deselectTwoDayEventVerifire = newState.includes("TwoDayEvent") && ((action.service === "Photography" && !newState.includes("VideoRecording")) || (action.service === "VideoRecording" && !newState.includes("Photography")));
            
            if (deselectBlurayVerifire) {
                return newState.filter(x => x != "BlurayPackage")
            }
            if (deselectTwoDayEventVerifire) {
                return newState.filter(x => x != "TwoDayEvent")
            }
            return newState;
        default:
            const state = [...previouslySelectedServices];
            const weddingSessionVerifier = action.service === "WeddingSession" && (state.includes("Photography") || state.includes("VideoRecording"));
            const blurayPackageVerifier = action.service === "BlurayPackage" && state.includes("VideoRecording");
            const actionsLogicVerifier = action.service != "BlurayPackage" && action.service != "WeddingSession";

            if (!state.includes(action.service)) {
                if (weddingSessionVerifier) {
                    return [...state, action.service];
                }
                if (blurayPackageVerifier) {
                    return [...state, action.service];
                }
                if(actionsLogicVerifier){
                    return [...state, action.service];
                }
            }
            return state;
    }
};

export const calculatePrice = (
    selectedServices: ServiceType[],
    selectedYear: ServiceYear
) => {
    var basePrice = 0;
    var discount = appyBiggestDiscount(selectedServices, selectedYear);
    selectedServices.map(x => {
        if (x === "Photography")
            basePrice += priceList.basePrices[selectedYear].Photography;

        if (x === "VideoRecording")
            basePrice += priceList.basePrices[selectedYear].VideoRecording;

        if (x === "BlurayPackage")
            basePrice += priceList.extra.BluerayPackage;

        if (x === "WeddingSession")
            basePrice += priceList.extra.WeddingSession;

        if (x === "TwoDayEvent")
            basePrice += priceList.extra.WeddingSession;
    })

    return { basePrice: basePrice, finalPrice: basePrice - discount }
};

export const priceList = {
    basePrices: {
        2020: {
            Photography: 1700,
            VideoRecording: 1700,
        },
        2021: {
            Photography: 1800,
            VideoRecording: 1800,
        },
        2022: {
            Photography: 1900,
            VideoRecording: 1900,
        }
    },
    extra: {
        BluerayPackage: 300,
        WeddingSession: 600,
        TwoDayEventPrices: 400,
    },
    discounts: {
        photoWithVideo:{
            2020: 2200,
            2021: 2300,
            2022: 2500
        },
        weddingSession: 300,
        weddingSession2020: 0
    }
}


const appyBiggestDiscount = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    var discounts: DiscountInterface[] = [];
    if(selectedServices.includes("Photography") && selectedServices.includes("VideoRecording")){
        const amount = priceList.basePrices[selectedYear].Photography + priceList.basePrices[selectedYear].VideoRecording - priceList.discounts.photoWithVideo[selectedYear];
        discounts.push({discount: "PhotographyAndVideo", amount: amount});
    }
    if(selectedServices.includes("WeddingSession")){
        const weddingSessionDiscounts = applyWeddingSessionDiscount(selectedServices,selectedYear);
        if(weddingSessionDiscounts != null){
            discounts.push(weddingSessionDiscounts)
        }
    }
    return discounts.map(x => x.amount).reduce((a,b) => a + b, 0);
}

const applyWeddingSessionDiscount = (selectedServices: ServiceType[], selectedYear: ServiceYear): DiscountInterface => {
    if(selectedYear === 2022 && selectedServices.includes("Photography")){
        const amount = priceList.extra.WeddingSession - priceList.discounts.weddingSession2020;
        return {discount: "WeddingSession2020", amount: amount};
    }
    if((selectedServices.includes("Photography") || selectedServices.includes("VideoRecording"))){
        const amount =priceList.extra.WeddingSession - priceList.discounts.weddingSession;
        return {discount: "WeddingSession", amount: amount};
    }
    return null;
}