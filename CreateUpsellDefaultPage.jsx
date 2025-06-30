import {
  Box,
  Center,
  Heading,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import getStarted from "../../../../assets/img/get-started.png";
import {
  closeProductModal,
  openProductModal,
} from "../../../../features/ocuModalSlice";
import {
  addAiGenerateProduct,
  addUpsellProduct,
  setRandomProductForABTest,
} from "../../../../features/ocuUpsellDataSlice";
// import ProductsModal from "../ProductsModal";
import CreateUpsellMenuOptions from "./CreateUpsellMenuOptions";
import { useAppQuery } from "../../../../hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

// const CreateUpsellDefaultPage = ({ handleAiGenerate }) => {
//     const dispatch = useDispatch()

//     const { isProductModalOpen, currentModalId, modalData } = useSelector((state) => state.ocuModal.productModalState)
//     const upsellOneProduct = useSelector((state) => state.ocuUpsellData.upsell?.offer?.upsell_one_product)

//     const isThisModalOpen = isProductModalOpen && currentModalId === "CreateUpsellDefault"

//     // States for AI generation
//     const [isAiGenerateLoading, setIsAiGenerateLoading] = useState(false)
//     const [currentFilterOptions, setCurrentFilterOptions] = useState([])
//     const [currentFilterIndex, setCurrentFilterIndex] = useState(0)
//     const [allCollectedProducts, setAllCollectedProducts] = useState([])
//     const [isCollectingProducts, setIsCollectingProducts] = useState(false)

//     const handleOpenProductModal = () => {
//         dispatch(
//         openProductModal({
//             modalId: "CreateUpsellDefault",
//             data: {
//             allowMultipleSelection: true,
//             maxProductSelect: 5,
//             },
//         }),
//         )
//     }

//     const handleProductsSelect = (product) => {
//         const updateData = {
//         upsellTitle: "upsell_one_product",
//         product: product,
//         }
//         dispatch(addUpsellProduct(updateData))
//     }

//     // Utility functions
//     const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

//     const getUniqueRandomProducts = (products, count, excludedIds) => {
//         const available = products.filter(
//         (p) => !excludedIds.has(p?.node?.handle) && !p?.node?.tags?.includes("nvd-hidden"),
//         )

//         const selectedIds = []

//         while (selectedIds.length < count && available.length > 0) {
//         const idx = Math.floor(Math.random() * available.length)
//         const selectedId = available[idx]?.node?.handle
//         selectedIds.push(selectedId)
//         excludedIds.add(selectedId)
//         available.splice(idx, 1)
//         }

//         return selectedIds
//     }

//     const getRandomFilterOption = (filterData) => {
//         const options = ["collections", "product_tags", "product_types", "product_vendors"]

//         const trySelect = () => {
//         const randomOptionIndex = Math.floor(Math.random() * options.length)
//         const randomOption = options[randomOptionIndex]
//         const optionData = filterData?.data?.[randomOption]

//         if (!Array.isArray(optionData) || optionData.length === 0) {
//             return trySelect() // retry
//         }

//         const randomIndex = Math.floor(Math.random() * optionData.length)
//         const selectOption = optionData[randomIndex]

//         if (!selectOption || selectOption === "nvd-hidden") {
//             return trySelect()
//         }

//         if (randomOption === "collections") {
//             return { collection: selectOption.id }
//         } else {
//             return { [randomOption]: selectOption }
//         }
//         }

//         return trySelect()
//     }

//     const buildQueryString = (filterOption) => {
//         const params = new URLSearchParams()

//         const vendor = filterOption?.product_vendors
//         const type = filterOption?.product_types
//         const collection = filterOption?.collection
//         const tag = filterOption?.tag

//         if (vendor) params.set("vendor", vendor)
//         if (type) params.set("product_type", type)
//         if (collection) params.set("collection_id", collection)
//         if (tag) params.set("product_tags", tag)

//         return params.toString()
//     }

//     // Fetch filter options using useAppQuery
//     const { data: productQueryOption, isLoading: isOptionLoading } = useAppQuery({
//         url: `/api/ocu/filter-options`,
//         enabled: isCollectingProducts, // Only fetch when we're collecting products
//     })

//     // Generate query string for current filter
//     const queryString = useMemo(() => {
//         if (!isCollectingProducts || currentFilterIndex >= currentFilterOptions.length) {
//         return ""
//         }
//         return buildQueryString(currentFilterOptions[currentFilterIndex])
//     }, [currentFilterOptions, currentFilterIndex, isCollectingProducts])

//     // Fetch products using useAppQuery
//     const {
//         data: productsFromStore,
//         isLoading: isProductLoading,
//         error: productError,
//     } = useAppQuery({
//         url: `/api/ocu/get-products?${queryString}`,
//         queryKey: ["searchQuery", currentFilterOptions[currentFilterIndex]],
//         enabled: isCollectingProducts && queryString !== "", // Only fetch when we have a valid query
//     })

//     // Process products when they arrive
//     useEffect(() => {
//         if (isProductLoading || !productsFromStore?.status) return

//         const products = productsFromStore?.data?.data?.products?.edges
//         if (products && products.length < 20) {
//             setAllCollectedProducts((prev) => [...prev, ...products])
//             console.log(`✅ Collected ${products.length} products from query ${currentFilterIndex + 1}`)
//         }

//         // Move to next filter or finish collection
//         if (currentFilterIndex < currentFilterOptions.length - 1 && allCollectedProducts.length < 20) {
//         setCurrentFilterIndex((prev) => prev + 1)
//         } else {
//         // Finished collecting products
//         }
//     }, [productsFromStore, isProductLoading, currentFilterIndex, isCollectingProducts])

//     const finishProductCollection = () => {
//         console.log(`🎯 Finished collecting. Total products: ${allCollectedProducts.length}`)

//         if (allCollectedProducts.length === 0) {
//             setIsAiGenerateLoading(false)
//             setIsCollectingProducts(false)
//             alert("No products found. Please try again.")
//             return
//         }

//         // Generate random product selections
//         console.log("🎲 Generating random product selections...")
//         const excluded = new Set()

//         const randomProducts = {
//         upsell_one_product: getUniqueRandomProducts(allCollectedProducts, getRandomInt(2, 6), excluded),
//         upsell_two_product: getUniqueRandomProducts(allCollectedProducts, getRandomInt(2, 6), excluded),
//         downsell_product: getUniqueRandomProducts(allCollectedProducts, getRandomInt(2, 6), excluded),
//         }

//         console.log("🎯 Selected product handles:", randomProducts)

//         // Dispatch the results
//         dispatch(setRandomProductForABTest({ randomProducts }))

//         // Call the original AI generate function
//         handleAiGenerate("upsell_one_product")

//         // Reset states
//         setIsAiGenerateLoading(false)
//         setIsCollectingProducts(false)
//         setAllCollectedProducts([])
//         setCurrentFilterOptions([])
//         setCurrentFilterIndex(0)

//         console.log("✨ AI product generation completed successfully!")
//     }

//     // Main AI generate function
//     const handleAiGenerateProduct = useCallback(async () => {
//         setIsAiGenerateLoading(true)
//         setAllCollectedProducts([])
//         setCurrentFilterIndex(0)

//         try {
//             console.log("🚀 Starting AI product generation...")

//             // Wait for filter options to load
//             setIsCollectingProducts(true)

//             // Generate multiple filter options for product collection
//             setTimeout(() => {
//                 if (productQueryOption?.status) {
//                     const randomFilter = getRandomFilterOption(productQueryOption)
//                     setCurrentFilterOptions(randomFilter)
//                     console.log('this is filter option', randomFilter)
//                 }

//                 // for (let i = 0; i < maxQueries; i++) {
//                 //     try {
//                 //     const randomFilter = getRandomFilterOption(productQueryOption)
//                 //     filterOptions.push(randomFilter)
//                 //     } catch (error) {
//                 //     console.warn(`Failed to generate filter option ${i + 1}:`, error)
//                 //     }
//                 // }

//                 // if (randomFilter.length === 0) {
//                 //     throw new Error("Failed to generate any filter options")
//                 // }

//                 console.log(`📋 Generated filter options`)
//                 console.log('All products from inside', allCollectedProducts)
//                 setCurrentFilterOptions(filterOptions)
//                 finishProductCollection()
//                 // }
//             }, 100)
//         } catch (error) {
//             console.error("❌ Error in AI product generation:", error)
//             alert(`Error generating AI products: ${error.message}`)
//             setIsAiGenerateLoading(false)
//             setIsCollectingProducts(false)
//         }
//     }, [productQueryOption])

//     console.log('All products', allCollectedProducts)

//     return (
//         <Box>
//         <Box minHeight="450px" display="flex" alignItems="center" justifyContent="center">
//             <Center flexDirection="column" w="full">
//             {isAiGenerateLoading ? (
//                 // Loading state
//                 <VStack spacing={4}>
//                 <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
//                 <VStack spacing={2}>
//                     <Heading size="md" textAlign="center">
//                     Generating AI Products...
//                     </Heading>
//                     <Text color="gray.500" textAlign="center">
//                         Please wait while we find the best products for your upsells
//                     </Text>
//                     {/* {allCollectedProducts.length > 0 && (
//                     <Text color="blue.500" fontSize="sm">
//                         Please wait while we find the best products for your upsells
//                     </Text>
//                     )} */}
//                 </VStack>
//                 </VStack>
//             ) : (
//                 // Default state
//                 <>
//                 <Box mb={6}>
//                     <Image src={getStarted || "/placeholder.svg"} alt="Upsell icon" objectFit="contain" />
//                 </Box>
//                 <Heading size="md" textAlign="center" mb={2}>
//                     Add an offer to get started
//                 </Heading>
//                 <Text color="gray.500" textAlign="center" mb={8}>
//                     Display products as upsell & cross-sell offers
//                 </Text>

//                 {/* Action button */}
//                 <CreateUpsellMenuOptions
//                     handleModalOpen={handleOpenProductModal}
//                     navidiumAiGenerate={handleAiGenerateProduct}
//                     cardTitle="upsell_one_product"
//                     isAiLoading={isAiGenerateLoading}
//                 />
//                 </>
//             )}
//             </Center>
//         </Box>

//         {/* Product Modal */}
//         {isThisModalOpen && (
//             <ProductsModal
//             isOpen={true}
//             onClose={() => dispatch(closeProductModal())}
//             onProductsSelect={handleProductsSelect}
//             allowMultipleSelection={modalData.allowMultipleSelection}
//             maxProductSelect={modalData.maxProductSelect}
//             selectedProducts={upsellOneProduct?.offer_products}
//             />
//         )}
//         </Box>
//     )
// }

import ProductsModal from "../ProductsModal";

// const CreateUpsellDefaultPage = ({ handleAiGenerate }) => {
//   const dispatch = useDispatch();
//   const { isProductModalOpen, currentModalId, modalData } = useSelector(
//     (state) => state.ocuModal.productModalState
//   );
//   const upsellOneProduct = useSelector(
//     (state) => state.ocuUpsellData.upsell?.offer?.upsell_one_product
//   );
//   const isThisModalOpen =
//     isProductModalOpen && currentModalId === "CreateUpsellDefault";
//   const [randomFilterOption, setRandomFilterOption] = useState(null);
//   const [storeProducts, setStoreProducts] = useState([]);
//   const [hasRun, setHasRun] = useState(false);
//   const [isAiGenerateLoading, setAiGenerateLoading] = useState(false);

//   const handleOpenProductModal = () => {
//     dispatch(
//       openProductModal({
//         modalId: "CreateUpsellDefault",
//         data: {
//           allowMultipleSelection: true,
//           maxProductSelect: 5,
//         },
//       })
//     );
//   };
//   const handleProductsSelect = (product) => {
//     const updateData = {
//       upsellTitle: "upsell_one_product",
//       product: product,
//     };
//     dispatch(addUpsellProduct(updateData));
//   };

//   const { data: productQueryOption, isLoading: isOptionLoading } = useAppQuery({
//     url: ` /api/ocu/filter-options`,
//   });

//   const randomFilterOptionHelper = (filterData) => {
//     const option = [
//       "collections",
//       "product_tags",
//       "product_types",
//       "product_vendors",
//     ];

//     const trySelect = () => {
//       const randomOptionLength = Math.floor(Math.random() * option.length);
//       const randomOption = option[randomOptionLength];
//       const optionData = filterData?.data?.[randomOption];

//       if (!Array.isArray(optionData) || optionData.length === 0) {
//         return trySelect(); // retry
//       }

//       const optionLength = optionData.length;
//       const randomLength = Math.floor(Math.random() * optionLength);
//       const selectOption = optionData[randomLength];

//       if (!selectOption || selectOption === "nvd-hidden") {
//         return trySelect();
//       }

//       if (randomOption === "collections") {
//         setRandomFilterOption({ collection: selectOption.id });
//       } else {
//         setRandomFilterOption({ [randomOption]: selectOption });
//       }
//     };

//     trySelect();
//   };

//   // useEffect(() => {
//   //     if (productQueryOption?.status && !hasRun) {
//   //         randomFilterOptionHelper(productQueryOption)
//   //         setHasRun(true)
//   //     }
//   // }, [productQueryOption, hasRun])

//   const queryString = useMemo(() => {
//     const params = new URLSearchParams();

//     const vendor = randomFilterOption?.product_vendors;
//     const type = randomFilterOption?.product_types;
//     const collection = randomFilterOption?.collection;
//     const tag = randomFilterOption?.tag;

//     if (vendor) params.set("vendor", vendor);
//     if (type) params.set("product_type", type);
//     if (collection) params.set("collection_id", collection);
//     if (tag) params.set("product_tags", tag);

//     return params.toString();
//   }, [randomFilterOption]);

//   const { data: productsFromStore, isLoading: isProductLoading } = useAppQuery({
//     url: ` /api/ocu/get-products?${queryString}`,
//     queryKey: ["searchQuery", randomFilterOption],
//   });
//   const getRandomInt = (min, max) =>
//     Math.floor(Math.random() * (max - min + 1)) + min;

//   const getUniqueRandomProducts = (products, count, excludedIds) => {
//     const available = products.filter(
//       (p) =>
//         !excludedIds.has(p?.node?.handle) &&
//         !p?.node?.tags?.includes("nvd-hidden")
//     );
//     const selectedIds = [];
//     // console.log('check available here', available.length)

//     while (selectedIds.length < count && available.length > 0) {
//       const idx = Math.floor(Math.random() * available.length);
//       const selectedId = available[idx]?.node?.handle;
//       selectedIds.push(selectedId);
//       excludedIds.add(selectedId);
//       available.splice(idx, 1);
//     }
//     // console.log('selectedId', selectedIds)
//     return selectedIds;
//   };

//   const finishProductCollection = useCallback(() => {
//     console.log("it's run");
//     if (!productsFromStore?.status || isProductLoading) return;
//     console.log("it's run 2");
//     const products = productsFromStore?.data?.data?.products?.edges;
//     if (!products || storeProducts?.length < 10) {
//       console.log("run from here", products);
//       setStoreProducts((prev) => [...prev, ...products]);
//       randomFilterOptionHelper(productQueryOption);
//       return;
//     }
//     console.log("All products from inside");

//     const excluded = new Set();
//     const randomProducts = {
//       upsell_one_product: getUniqueRandomProducts(
//         storeProducts,
//         getRandomInt(2, 6),
//         excluded
//       ),
//       upsell_two_product: getUniqueRandomProducts(
//         storeProducts,
//         getRandomInt(2, 6),
//         excluded
//       ),
//       downsell_product: getUniqueRandomProducts(
//         storeProducts,
//         getRandomInt(2, 6),
//         excluded
//       ),
//     };

//     console.log("Selected handles:", randomProducts);
//     dispatch(setRandomProductForABTest({ randomProducts }));
//     setAiGenerateLoading(false);
//   }, [productsFromStore?.status, storeProducts]);

//   const handleAiGenerateProduct = () => {
//     setAiGenerateLoading(true);
//     try {
//       if (productQueryOption?.status) {
//         randomFilterOptionHelper(productQueryOption);
//         setHasRun(true);
//       }
//       finishProductCollection();
//       console.log("finished done");
//     } catch (error) {
//       console.error("❌ Error in AI product generation:", error);
//       setAiGenerateLoading(false);
//     }

//     // handleAiGenerate("upsell_one_product")
//   };

//   // console.log('check store product', productQueryOption) nvd-hidden
//   console.log("store random generate products", storeProducts);
//   return (
//     <Box>
//       <Box
//         minHeight="450px"
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//       >
//         <Center flexDirection="column" w="full">
//           {isAiGenerateLoading ? (
//             // Loading state
//             <VStack spacing={4}>
//               <Spinner
//                 size="xl"
//                 thickness="4px"
//                 speed="0.65s"
//                 emptyColor="gray.200"
//                 color="blue.500"
//               />
//               <VStack spacing={2}>
//                 <Heading size="md" textAlign="center">
//                   Generating AI Products...
//                 </Heading>
//                 <Text color="gray.500" textAlign="center">
//                   loading ai generate
//                 </Text>
//               </VStack>
//             </VStack>
//           ) : (
//             // Default state
//             <>
//               <Box mb={6}>
//                 <Image
//                   src={getStarted || "/placeholder.svg"}
//                   alt="Upsell icon"
//                   objectFit="contain"
//                 />
//               </Box>
//               <Heading size="md" textAlign="center" mb={2}>
//                 Add an offer to get started
//               </Heading>
//               <Text color="gray.500" textAlign="center" mb={8}>
//                 Display products as upsell & cross-sell offers
//               </Text>

//               {/* Action button */}
//               <CreateUpsellMenuOptions
//                 handleModalOpen={handleOpenProductModal}
//                 navidiumAiGenerate={handleAiGenerateProduct}
//                 cardTitle="upsell_one_product"
//                 isAiLoading={isAiGenerateLoading}
//               />
//             </>
//           )}
//         </Center>
//       </Box>

//       {/* Product Modal  */}
//       {isThisModalOpen && (
//         <ProductsModal
//           isOpen={true}
//           onClose={() => dispatch(closeProductModal())}
//           onProductsSelect={handleProductsSelect}
//           allowMultipleSelection={modalData.allowMultipleSelection}
//           maxProductSelect={modalData.maxProductSelect}
//           selectedProducts={upsellOneProduct?.offer_products}
//         />
//       )}

//       {/* Product Modal  */}
//       {/* {isThisModalOpen && <OcuProductModelTest2 isOpen={true} onClose={() => dispatch(closeProductModal())} onProductsSelect={handleProductsSelect} allowMultipleSelection={modalData.allowMultipleSelection} maxProductSelect={modalData.maxProductSelect} selectedProducts={upsellOneProduct?.offer_products} />} */}
//     </Box>
//   );
// };

const getRandomFilterOption = (filterData) => {
  const options = [
    "collections",
    "product_tags",
    "product_types",
    "product_vendors",
  ];
  while (true) {
    const randomOption = options[Math.floor(Math.random() * options.length)];
    const optionData = filterData?.data?.[randomOption];
    if (!Array.isArray(optionData) || optionData.length === 0) continue;
    const selectOption =
      optionData[Math.floor(Math.random() * optionData.length)];
    if (!selectOption || selectOption === "nvd-hidden") continue;
    if (randomOption === "collections") {
      return { collection: selectOption.id };
    } else {
      return { [randomOption]: selectOption };
    }
  }
};

const buildQueryString = (filterOption) => {
  const params = new URLSearchParams();
  if (filterOption?.product_vendors)
    params.set("vendor", filterOption.product_vendors);
  if (filterOption?.product_types)
    params.set("product_type", filterOption.product_types);
  if (filterOption?.collection)
    params.set("collection_id", filterOption.collection);
  if (filterOption?.product_tags)
    params.set("product_tags", filterOption.product_tags);
  return params.toString();
};

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getUniqueRandomProducts = (products, count, excludedIds) => {
  const available = products.filter(
    (p) =>
      !excludedIds.has(p?.node?.handle) &&
      !p?.node?.tags?.includes("nvd-hidden")
  );
  const selectedIds = [];
  while (selectedIds.length < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    const selectedId = available[idx]?.node?.handle;
    selectedIds.push(selectedId);
    excludedIds.add(selectedId);
    available.splice(idx, 1);
  }
  return selectedIds;
};

const CreateUpsellDefaultPage = () => {
  const dispatch = useDispatch();
  const { isProductModalOpen, currentModalId, modalData } = useSelector(
    (state) => state.ocuModal.productModalState
  );
  const upsellOneProduct = useSelector(
    (state) => state.ocuUpsellData.upsell?.offer?.upsell_one_product
  );
  const isThisModalOpen =
    isProductModalOpen && currentModalId === "CreateUpsellDefault";
  const [isAiGenerateLoading, setAiGenerateLoading] = useState(false);

  // State for triggering product fetch
  const [productQuery, setProductQuery] = useState(null);
  const [pending, setPending] = useState(false);

  // Always fetch filter options with useAppQuery
  const {
    data: filterOptions,
    isLoading: isFilterLoading,
    error: filterError,
    refetch: refetchFilterOptions,
  } = useAppQuery({
    url: `/api/ocu/filter-options`,
  });

  // Fetch products with useAppQuery, only when productQuery is set
  const {
    data: productsFromStore,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProducts,
  } = useAppQuery({
    url: productQuery ? `/api/ocu/get-products?${productQuery}` : "",
    queryKey: ["searchQuery", productQuery],
    enabled: !!productQuery,
  });

  // Modal open handler
  const handleOpenProductModal = () => {
    dispatch(
      openProductModal({
        modalId: "CreateUpsellDefault",
        data: {
          allowMultipleSelection: true,
          maxProductSelect: 5,
        },
      })
    );
  };

  // Product select handler
  const handleProductsSelect = (product) => {
    const updateData = {
      upsellTitle: "upsell_one_product",
      product: product,
    };
    dispatch(addUpsellProduct(updateData));
  };

  // Main AI generate function
  const handleAiGenerateProduct = useCallback(async () => {
    setAiGenerateLoading(true);
    setPending(true);

    // If filter options are not loaded, refetch and wait
    if (!filterOptions?.status) {
      await refetchFilterOptions();
      return; // Wait for useEffect to continue
    }

    // Pick a random filter and trigger product fetch
    const randomFilter = getRandomFilterOption(filterOptions);
    const queryString = buildQueryString(randomFilter);
    setProductQuery(queryString);
  }, [filterOptions, refetchFilterOptions]);

  // When filterOptions are loaded after a click, continue the flow
  useEffect(() => {
    if (!pending || isFilterLoading) return;
    if (!filterOptions?.status) return;
    // Pick a random filter and trigger product fetch
    const randomFilter = getRandomFilterOption(filterOptions);
    const queryString = buildQueryString(randomFilter);
    setProductQuery(queryString);
    // eslint-disable-next-line
  }, [filterOptions, isFilterLoading, pending]);

  // When products are loaded, finish the flow
  useEffect(() => {
    if (!pending || !productQuery) return;
    if (isProductLoading) return;
    if (!productsFromStore?.status) return;

    const products = productsFromStore?.data?.data?.products?.edges || [];
    if (!products || products.length === 0) {
      setAiGenerateLoading(false);
      setPending(false);
      setProductQuery(null);
      alert("No products found for random filter");
      return;
    }

    const excluded = new Set();
    const randomProducts = {
      upsell_one_product: getUniqueRandomProducts(
        products,
        getRandomInt(2, 6),
        excluded
      ),
      upsell_two_product: getUniqueRandomProducts(
        products,
        getRandomInt(2, 6),
        excluded
      ),
      downsell_product: getUniqueRandomProducts(
        products,
        getRandomInt(2, 6),
        excluded
      ),
    };

    dispatch(setRandomProductForABTest({ randomProducts }));
    dispatch(addAiGenerateProduct("upsell_one_product"));
    // if (handleAiGenerate) handleAiGenerate("upsell_one_product");
    setAiGenerateLoading(false);
    setPending(false);
    setProductQuery(null);
    // eslint-disable-next-line
  }, [productsFromStore, isProductLoading, pending, productQuery]);

  //   console.log("check upsell", upsellOneProduct);
  return (
    <Box>
      <Box
        minHeight="450px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Center flexDirection="column" w="full">
          {isAiGenerateLoading ? (
            <VStack spacing={4}>
              <Spinner
                size="xl"
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
              />
              <VStack spacing={2}>
                <Heading size="md" textAlign="center">
                  Generating AI Products...
                </Heading>
                <Text color="gray.500" textAlign="center">
                  Please wait while we find the best products for your upsells
                </Text>
              </VStack>
            </VStack>
          ) : (
            <>
              <Box mb={6}>
                <Image
                  src={getStarted || "/placeholder.svg"}
                  alt="Upsell icon"
                  objectFit="contain"
                />
              </Box>
              <Heading size="md" textAlign="center" mb={2}>
                Add an offer to get started
              </Heading>
              <Text color="gray.500" textAlign="center" mb={8}>
                Display products as upsell & cross-sell offers
              </Text>
              <CreateUpsellMenuOptions
                handleModalOpen={handleOpenProductModal}
                navidiumAiGenerate={handleAiGenerateProduct}
                cardTitle="upsell_one_product"
                isAiLoading={isAiGenerateLoading}
              />
            </>
          )}
        </Center>
      </Box>
      {isThisModalOpen && (
        <ProductsModal
          isOpen={true}
          onClose={() => dispatch(closeProductModal())}
          onProductsSelect={handleProductsSelect}
          allowMultipleSelection={modalData.allowMultipleSelection}
          maxProductSelect={modalData.maxProductSelect}
          selectedProducts={upsellOneProduct?.offer_products}
        />
      )}
    </Box>
  );
};

export default CreateUpsellDefaultPage;
