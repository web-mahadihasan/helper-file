import { createSlice } from "@reduxjs/toolkit";
import navidiumAiProduct from "../assets/img/navidiumAiProduct.png";
import sameCartProduct from "../assets/img/sameCartProduct.png";
import { format } from "date-fns";

const initialTriggerData = {
    product_trigger: {
        products: [],
    },
    product_quantity_trigger: {
        logic_operator: "AND",
        conditions: [
            [
                {
                    id: 1,
                    quantity: 1,
                    operator: "more-than",
                    product_data: null,
                },
            ],
        ],
    },
    product_tag_trigger: {
        operator: "includes",
        tags: ["ex. Mens"],
    },
    product_collection_trigger: {
        collections: [],
    },
    subscription_trigger: {
        operator: "include a subscription",
    },
    variant_name_trigger: {
        operator: "includes",
        variants: ["ex. Mens"],
    },
    order_value_trigger: {
        operator: "more-than",
        amount: {
            currency: "USD",
            amountValue: 100,
        },
    },
    cart_quantity_trigger: {
        operator: "more-than",
        quantity: 1,
    },
    discount_code_trigger: {
        operator: "includes",
        discountCode: "",
    },
    discount_percent_trigger: {
        operator: "more-than",
        discountPercentage: 15,
    },
    customer_tag_trigger: {
        operator: "includes",
        tags: ["ex. Mens"],
    },
    customer_order_history_trigger: {
        operator: "customer previously ordered",
        products: [],
    },
    customer_order_count_trigger: {
        operator: "more-than",
        orderCount: 1,
    },
    customer_language_trigger: {
        conditions: [
            {
                id: 1,
                language: null,
            },
        ],
    },
    one_per_customer_trigger: {
        one_per_customer_trigger: true,
    },
    utm_Parameter_Trigger: [{ utm_medium: null }, { utm_source: null }, { utm_campaign: null }, { utm_term: null }, { utm_id: null }, { utm_content: null }],
    currency_trigger: {
        operator: "default store currency only",
        currencyCode: "USD"
    },

    funnelData: {
        name: "",
        status: 'active',
        upsell: {
            triggers: {
                show_all_customer: true,
                triggers_data: [],
            },
            offer: {
                upsell_one_product: {
                    offer_products: [],
                    ab_test_products: null,
                },
                upsell_two_product: {
                    offer_products: [],
                    ab_test_products: null,
                },
                downsell_product: {
                    offer_products: [],
                    ab_test_products: null,
                },
            },
        },
    }
};

const initialState = {
    ...initialTriggerData.funnelData
};

const ocuUpsellDataSlice = createSlice({
    name: "OcuConditionAction",
    initialState,
    reducers: {
        updateFunnelData: (state, action) => {
            const {name, value} = action.payload;
            state[name] = value
        },
        setGlobalCustomer: (state, action) => {
            state.upsell.triggers.show_all_customer = action.payload;
        },
        // Add trigger
        addNewTriggerOption: (state, action) => {
            const { storeTitle, component } = action.payload;
            const triggersList = state.upsell?.triggers?.triggers_data;

            const isExist = triggersList?.some((t) => t.type === storeTitle);

            if (!isExist) {
                const newId = triggersList?.length > 0 ? Math.max(...triggersList.map((t) => t.id)) + 1 : 1;

                const newTrigger = {
                    type: storeTitle,
                    id: newId,
                    triggers_value: initialTriggerData[storeTitle],
                };
                triggersList.push(newTrigger);
            }
        },
        // Remove Trigger
        removeTriggerComponent: (state, action) => {
            const { id, type } = action.payload;
            const triggersList = state.upsell.triggers.triggers_data;

            const isExist = triggersList.find((t) => t.type === type);

            if (isExist) {
                state.upsell.triggers.triggers_data = triggersList.filter((prevItem) => prevItem.type !== type);
            }
        },

        // Add product Trigger Data
        addProductInTriggerValue: (state, action) => {
            const { id, type, products, name } = action.payload;
            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger && name === 'collections') {
                trigger.triggers_value[name] = products;
            } else{
                trigger.triggers_value.products = products;
            }
        },
        // Handle Operation in trigger
        setOperatorInTrigger: (state, action) => {
            const { type, operator } = action.payload;
            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger) {
                trigger.triggers_value.operator = operator;
            }
        },

        // Add tags in trigger
        setTriggerInputField: (state, action) => {
            const { type, data, name } = action.payload;

            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger) {
                trigger.triggers_value[name] = data;
            }
        },
        // Remove tags in trigger
        removeTriggerInputField: (state, action) => {
            const { type, removeData, name } = action.payload;

            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger) {
                trigger.triggers_value[name] = trigger.triggers_value[name].filter((t) => t !== removeData);
            }
        },

        // Add condition inside trigger
        addNewConditionForTriggerOption: (state, action) => {
            const { type, condition } = action.payload;
            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);
            if (trigger && trigger.triggers_value.conditions) {
                trigger.triggers_value?.conditions.push(condition);
            }
        },
        // Remove condition inside trigger
        removeConditionForTriggerOption: (state, action) => {
            const { type, id } = action.payload;

            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger && trigger.triggers_value.conditions) {
                trigger.triggers_value.conditions = trigger.triggers_value.conditions.filter((c) => c.id !== id);
            }
        },
        // Update language in customer language trigger
        updateLanguageForTrigger: (state, action) => {
            const { type, language, id } = action.payload;

            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger?.triggers_value?.conditions) {
                const condition = trigger.triggers_value.conditions.find((c) => c.id === id);
                if (condition) {
                    condition.language = language;
                }
            }
        },

        // Handle UTM parameter
        setTriggerUTMField: (state, action) => {
            const { type, field, value } = action.payload;
            const trigger = state.upsell.triggers.triggers_data.find((trigger) => trigger.type === type);

            if (trigger) {
                const fieldObj = trigger.triggers_value.find((item) => Object.keys(item)[0] === field);

                if (fieldObj) {
                    fieldObj[field] = value;
                }
            }
        },

        // product quantity trigger handle

        // Add a condition to an existing group (OR logic)
        setOrConditionForQtyTrigger: (state, action) => {
            const { type, groupIndex } = action.payload;

            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger && trigger.triggers_value.conditions) {
                // Add a new or condition to the specified group
                let maxId = 0;
                trigger.triggers_value.conditions.forEach((group) => {
                    group.forEach((condition) => {
                        if (condition.id > maxId) maxId = condition.id;
                    });
                });

                // Add a new condition to the specified group
            if (trigger.triggers_value.conditions[groupIndex]) {
                trigger.triggers_value.conditions[groupIndex].push({
                    id: maxId + 1,
                    quantity: 1,
                    operator: "more-than",
                    product_data: null,
                });
            }
            }
        },

        // Remove a condition from a group
        removeConditionForQTYTrigger: (state, action) => {
            const { groupIndex, conditionId, type } = action.payload;

            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);
            // If this group exists
            if (trigger && trigger.triggers_value.conditions[groupIndex]) {
                // Filter out the condition with the matching ID
                trigger.triggers_value.conditions[groupIndex] = trigger.triggers_value.conditions[groupIndex].filter((condition) => condition.id !== conditionId);

                // If the group is now empty, remove the entire group
                if (trigger.triggers_value.conditions[groupIndex].length === 0) {
                    trigger.triggers_value.conditions.splice(groupIndex, 1);

                    // If all groups are removed, add back one default group
                    if (trigger.triggers_value.conditions.length === 0) {
                        trigger.triggers_value.conditions.push([
                            {
                                id: 1,
                                quantity: 1,
                                operator: "more-than",
                                product_data: null,
                            },
                        ]);
                    }
                }
            }
        },

        // Update a specific condition In product qty trigger
        updateConditionForQTYTrigger: (state, action) => {
            const { groupIndex, conditionId, field, value, type } = action.payload
            
            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            // Find the condition and update it
            if (trigger && trigger.triggers_value.conditions[groupIndex]) {
            const conditionIndex = trigger.triggers_value.conditions[groupIndex].findIndex((c) => c.id === conditionId)
    
            if (conditionIndex !== -1) {
                trigger.triggers_value.conditions[groupIndex][conditionIndex] = {
                ...trigger.triggers_value.conditions[groupIndex][conditionIndex],
                [field]: value,
                }
            }
            }
        },

        // Update product data for product qty trigger condition
        updateProductDataForQTYTrigger: (state, action) => {
            const { groupIndex, conditionId, productData, type } = action.payload
            
            const trigger = state.upsell.triggers.triggers_data.find((t) => t.type === type);

            if (trigger && trigger.triggers_value.conditions[groupIndex]) {
            const conditionIndex = trigger.triggers_value.conditions[groupIndex].findIndex((c) => c.id === conditionId)
    
            if (conditionIndex !== -1) {
                trigger.triggers_value.conditions[groupIndex][conditionIndex].product_data = productData
            }
            }
        },


        // For Upsell Product & AB test products function
        addUpsellProduct: (state, action) => {
            const { upsellTitle, product } = action.payload;

            if (state.upsell.offer[upsellTitle]) {
                // console.log("click")
                state.upsell.offer[upsellTitle].offer_products = product;
            }
        },
        removeUpsellProduct: (state, action) => {
            const {upsellTitle} = action.payload

            if(upsellTitle === 'upsell_one_product'){
                state.upsell.offer = initialTriggerData.funnelData.upsell.offer
            } else {
                if (state.upsell.offer[upsellTitle]) {
                    state.upsell.offer[upsellTitle].offer_products = [];
                }
            }
        },
        addAiGenerateProduct: (state, action) => {
            console.log('redux store random', state?.randomGenerateProduct)
            const aiProduct = [
                {
                    node: {
                        isAiGenerate: true,
                        title: "AI generated product",
                        featuredMedia: {
                            preview: {
                                image: {
                                    transformedSrc: navidiumAiProduct
                                }
                            }
                        },
                        variants: {
                            edges: [{node: {price: 100}}]
                        },
                        id: 'ai_1001',
                        products: state.randomGenerateProduct[action.payload]
                    }
                }
            ];
            
            if (state.upsell.offer[action.payload]) {
                state.upsell.offer[action.payload].offer_products = aiProduct;
                console.log(action.payload)
            }
            // console.log(state[action.payload]);
        },
        addABTestProduct: (state, action) => {
            const { upsellTitle, product } = action.payload;
            const date = new Date();
            if (state.upsell.offer[upsellTitle]) {
                const currentOfferProducts = state.upsell.offer[upsellTitle].offer_products;
                
                const updateAbTest = {
                    ab_test: true,
                    conditionA: currentOfferProducts,
                    conditionB: product
                }
                state.upsell.offer[upsellTitle].ab_test_products = updateAbTest;
            }
            
        },
        updateABTestProduct: (state, action) => {
            const { upsellTitle, product, productIndex } = action.payload;
            console.log(productIndex);
            if (state.upsell.offer[upsellTitle] && productIndex === 0) {
                state.upsell.offer[upsellTitle].ab_test_products.conditionA = product;
            } else if (state.upsell.offer[upsellTitle] && productIndex === 1) {
                state.upsell.offer[upsellTitle].ab_test_products.conditionB = product;
            }
        },
        removeABTestProduct: (state, action) => {
            if (state.upsell.offer[action.payload]) {
                state.upsell.offer[action.payload].ab_test_products = null;
            }
        },
        // Set some random products for store front
        setRandomProductForABTest: (state, action) => {
            const {randomProducts} = action.payload
            console.log('set a')
            console.log(randomProducts)
            if(!state.randomGenerateProduct) {
                state.randomGenerateProduct = {};
            }
            if(randomProducts) {
                state.randomGenerateProduct = randomProducts
                console.log('set b')
            }
        },

        startOcuAbTest: (state, action) => {
            const {cardTitle} = action.payload

            const date = new Date();
            if (!state.ab_test_status) {
                state.ab_test_status = {};
            }
            state.ab_test_status[cardTitle] = {
                start_time: format(date, 'yyyy-MM-dd HH:mm:ss'),
                end_time: null,
                status: true
            }
        },

        stopOcuAbTest: (state, action) => {
            const {cardTitle, startTime} = action.payload
            const date = new Date();

            if (state.ab_test_status) {
                state.ab_test_status[cardTitle] = {
                    start_time: startTime,
                    end_time: format(date, 'yyyy-MM-dd HH:mm:ss'),
                    status: false
                }
            }
        },

        addSameAsCartProduct: (state, action) => {
            const createCartProduct = [
                {
                    node: {
                        isSameProductCart: true,
                        title: "Same product as in cart",
                        featuredMedia: {
                            preview: {
                                image: {
                                    transformedSrc: sameCartProduct
                                }
                            }
                        },
                        variants: {
                            edges: [{node: {price: 50}}]
                        },
                        id: 'cart_1001'
                    },
                }
            ];
            if (state.upsell.offer[action.payload]) {
                state.upsell.offer[action.payload].offer_products = createCartProduct;
            }
        },

        // Update full initial state
        updateWithExistingData: (state, action) => {
            return {
                name: action.payload.name,
                status: action.payload.status,
                upsell: action.payload.upsell_data.upsell,
                ab_test_status: action.payload.upsell_data.ab_test_status,
                upsellAnalytics: action.payload?.analytics
            };
        },

        // Reset all data
        resetAllData: () => initialTriggerData.funnelData,

    },
});

export const {
    // For trigger 
    updateFunnelData,
    setGlobalCustomer,
    addNewTriggerOption,
    removeTriggerComponent,
    addProductInTriggerValue,
    setOperatorInTrigger,
    setTriggerInputField,
    removeTriggerInputField,
    addVariantInTrigger,
    addNewConditionForTriggerOption,
    removeConditionForTriggerOption,
    updateLanguageForTrigger,
    setTriggerUTMField,

    // For product qty trigger 
    setOrConditionForQtyTrigger,
    removeConditionForQTYTrigger,
    updateConditionForQTYTrigger,
    updateProductDataForQTYTrigger,

    // For Upsell Product & ab test
    addUpsellProduct,
    removeUpsellProduct,
    addAiGenerateProduct,
    addABTestProduct,
    updateABTestProduct,
    removeABTestProduct,
    startOcuAbTest,
    stopOcuAbTest,
    setRandomProductForABTest,

    // Others function 
    addSameAsCartProduct,
    updateWithExistingData,
    resetAllData

} = ocuUpsellDataSlice.actions;

export default ocuUpsellDataSlice.reducer;
