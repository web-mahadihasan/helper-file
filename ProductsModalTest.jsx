import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Checkbox,
  CloseButton,
  Flex,
  FormLabel,
  Grid,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAppQuery } from "../../../hooks";
import CustomActionButton from "./CustomActionButton";
import { OcuProductModalLoader } from "./OcuLoader";
import ProductsModalFilterOption from "./ProductsModalFilterOption";
import currencies from "../../../lib/data/currencies";
import { ShopDetailsContext } from "../../../lib/provider/ShopDetailsProvider";

const PAGE_SIZE = 20; // adjust as needed

const ProductsModalTest = ({
  isOpen,
  onClose,
  onProductsSelect,
  products = [],
  allowMultipleSelection = true,
  selectedProducts = [],
  maxProductSelect = 1,
}) => {
  // State management
  const [selection, setSelection] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [productData, setProductData] = useState([]);
  const scrollRef = useRef(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [endCursor, setEndCursor] = useState(null);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const { currencyCode } = useContext(ShopDetailsContext) || {};

  // Track last query for deduplication
  const lastQueryRef = useRef("");

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterOptions?.vendor?.length)
      params.set("vendor", filterOptions.vendor.join(","));
    if (filterOptions?.type?.length)
      params.set("product_type", filterOptions.type.join(","));
    if (filterOptions?.collection?.id)
      params.set("collection_id", filterOptions.collection.id);
    if (filterOptions?.tag?.length)
      params.set("tags", filterOptions.tag.join(","));
    if (searchQuery) params.set("search_key", searchQuery);
    if (endCursor) params.set("cursor", endCursor);
    return params.toString();
  }, [filterOptions, searchQuery, endCursor]);

  // Fetch products
  const {
    data: modalProducts,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
    refetch: productRefetch,
  } = useAppQuery({
    url: `/api/ocu/get-products?${queryString}`,
    queryKey: [searchQuery, JSON.stringify(filterOptions), endCursor],
  });

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSelection(selectedProducts.map((product) => ({ ...product })));
      setSearchQuery("");
      setFilterOptions({});
      setEndCursor(null);
      setProductData([]);
      setExpandedId(selectedProducts[0]?.node?.id || null);
      setIsInitialLoading(true);
      setIsPaginating(false);
      setHasNextPage(true);
      // Reset scroll
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }, 0);
    }
  }, [isOpen, selectedProducts]);

  // Handle data fetch
  useEffect(() => {
    if (!modalProducts?.status) return;

    const newProducts = modalProducts?.data?.data?.products?.edges || [];
    const nextPage = modalProducts?.pagination?.has_next_page;
    setHasNextPage(nextPage);

    // If it's a new filter/search (not paginating), replace productData
    if (!isPaginating || endCursor === null) {
      setProductData(newProducts);
      setIsInitialLoading(false);
    } else {
      // Pagination: append, deduplicate
      setProductData((prev) => {
        const existingIds = new Set(prev.map((p) => p.node.id));
        const filteredNew = newProducts.filter(
          (p) => !existingIds.has(p.node.id)
        );
        return [...prev, ...filteredNew];
      });
      setIsPaginating(false);
    }
    // eslint-disable-next-line
  }, [modalProducts]);

  // Scroll handler for infinite scroll
  const handleScroll = (e) => {
    if (
      productLoading ||
      productFetching ||
      !modalProducts?.pagination?.has_next_page
    )
      return;

    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    const threshold = scrollHeight * 0.4;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      previousScrollHeightRef.current = e.currentTarget.scrollHeight;
      setEndCursor(modalProducts?.pagination?.end_cursor);
    }
  };

  // Handle filter apply
  const handleFilterApply = (newFilters) => {
    setFilterOptions(newFilters);
    setEndCursor(null);
    setProductData([]);
    setIsInitialLoading(true);
    setIsPaginating(false);
    setHasNextPage(true);
    // Reset scroll
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 0);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setEndCursor(null);
    setProductData([]);
    setIsInitialLoading(true);
    setIsPaginating(false);
    setHasNextPage(true);
    // Reset scroll
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 0);
  };

  // Selection helpers (unchanged)
  const handleCheckboxChange = (product) => {
    setExpandedId((prevId) => (prevId === product.id ? null : product.id));
    setSelection((prevSelection) => {
      const isAlreadySelected = prevSelection.some(
        (p) => p.node && p.node.id === product.id
      );
      const formattedVariants =
        product.variants?.edges?.length > 0 ? product.variants.edges : null;
      if (!allowMultipleSelection) {
        return [
          {
            node: {
              ...product,
              variants: {
                edges: formattedVariants,
              },
            },
          },
        ];
      }
      if (isAlreadySelected) {
        return prevSelection.filter((p) => p.node && p.node.id !== product.id);
      }
      if (prevSelection.length >= maxProductSelect) {
        toast.error(`You can select up to ${maxProductSelect} products.`);
        return prevSelection;
      }
      return [
        ...prevSelection,
        {
          node: {
            ...product,
            variants: {
              edges: formattedVariants,
            },
          },
        },
      ];
    });
  };

  const toggleVariant = (productId, variant, variantId) => {
    setSelection((prevSelection) => {
      const productIndex = prevSelection.findIndex(
        (p) => p.node && p.node.id === productId
      );
      if (productIndex === -1) {
        const productToAdd = productData.find((p) => p.node.id === productId);
        if (!productToAdd) return prevSelection;
        if (
          prevSelection.length >= maxProductSelect &&
          allowMultipleSelection
        ) {
          toast.error(`You can select up to ${maxProductSelect} products.`);
          return prevSelection;
        }
        return [
          ...prevSelection,
          {
            node: {
              ...productToAdd.node,
              variants: {
                edges: [{ node: variant }],
              },
            },
          },
        ];
      }
      const updatedSelection = [...prevSelection];
      const product = { ...updatedSelection[productIndex] };
      if (!product.node)
        product.node = { id: productId, variants: { edges: [] } };
      if (!product.node.variants) product.node.variants = { edges: [] };
      if (!product.node.variants.edges) product.node.variants.edges = [];
      const variantIndex = product.node.variants.edges.findIndex(
        (v) => v.node.id === variantId
      );
      if (variantIndex >= 0) {
        product.node.variants.edges = product.node.variants.edges.filter(
          (v) => v.node.id !== variantId
        );
        if (product.node.variants.edges.length === 0) {
          return updatedSelection.filter(
            (p) => p.node && p.node.id !== productId
          );
        }
      } else {
        product.node.variants.edges = [
          ...product.node.variants.edges,
          { node: variant },
        ];
      }
      updatedSelection[productIndex] = product;
      return updatedSelection;
    });
  };

  const isProductSelected = (productId) => {
    return selection.some((p) => p.node && p.node.id === productId);
  };

  const isVariantSelected = (productId, variantId) => {
    const product = selection.find((p) => p.node && p.node.id === productId);
    return (
      product?.node?.variants?.edges?.some(
        (edge) => edge.node.id === variantId
      ) || false
    );
  };

  const handleConfirm = () => {
    if (selection.length === 0) {
      toast.error("Select at least one product before proceeding.");
      return;
    }
    onProductsSelect(selection);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="md" maxW="550px">
        <ModalHeader
          p={4}
          borderBottomWidth="1px"
          borderColor="gray.100"
          bg={"#F8F8F8"}
          borderTopRadius="xl"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="md" fontWeight="semibold">
              Add products ({selection.length}/{maxProductSelect || 1}) test
            </Text>
            <CloseButton onClick={onClose} p={"10px"} bg={"#FFF"} />
          </Flex>
        </ModalHeader>

        <ModalBody p={4}>
          <HStack mb={4}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={SearchIcon} boxSize={5} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search"
                fontWeight={500}
                fontSize={"sm"}
                value={searchQuery}
                onChange={handleSearchChange}
                borderRadius="md"
                bg="#F8F8F8"
                borderColor={"#EBEBEB"}
              />
            </InputGroup>
            <ProductsModalFilterOption
              handleFilterApply={handleFilterApply}
              filterOptions={filterOptions}
            />
          </HStack>

          {/* Filter option  */}
          <HStack mb={0}>
            <Flex fontSize="sm" flexWrap={"wrap"} fontWeight={500} gap={2}>
              {Object.keys(filterOptions).map((filter) => (
                <Flex
                  key={filter}
                  fontSize="sm"
                  fontWeight={500}
                  px={2}
                  py={"6px"}
                  border={"1px"}
                  borderRadius={"8px"}
                  borderColor={"#EBEBEB"}
                  bg={"#F8F8F8"}
                  alignItems="center"
                  gap={2}
                >
                  {filter === "collection" ? (
                    <Text textTransform={"capitalize"} noOfLines={1}>
                      {filter}: {filterOptions[filter].title}
                    </Text>
                  ) : (
                    <Text textTransform={"capitalize"} noOfLines={1}>
                      {filter}:{" "}
                      {filterOptions[filter].length > 2
                        ? `${filterOptions[filter][0]}, ${
                            filterOptions[filter][1]
                          } +${filterOptions[filter].length - 2} more`
                        : filterOptions[filter].length === 1
                        ? filterOptions[filter][0]
                        : filterOptions[filter].map((item) => item).join(", ")}
                    </Text>
                  )}

                  <Icon
                    as={CloseButton}
                    size="sm"
                    onClick={() => {
                      if (filter && filterOptions.hasOwnProperty(filter)) {
                        const newFilters = { ...filterOptions };
                        delete newFilters[filter];
                        setFilterOptions(newFilters);
                        setEndCursor(null);
                        setProductData([]);
                        setIsInitialLoading(true);
                        setIsPaginating(false);
                        setHasNextPage(true);
                        setTimeout(() => {
                          if (scrollRef.current)
                            scrollRef.current.scrollTop = 0;
                        }, 0);
                      }
                    }}
                    cursor="pointer"
                    _hover={{
                      opacity: 0.7,
                    }}
                  />
                </Flex>
              ))}
            </Flex>
          </HStack>

          <Box
            maxH="400px"
            minH="400px"
            overflowY="auto"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {/* Top loader for filter/search */}
            {isInitialLoading && (
              <Grid templateColumns="repeat(1fr)" gap={4} mr={3}>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <OcuProductModalLoader key={idx} />
                ))}
              </Grid>
            )}

            {/* Error state */}
            {productError && (
              <Text textAlign="center" color="red.500" py={4}>
                Error loading products. Please try again.
              </Text>
            )}

            {/* No products found state */}
            {!isInitialLoading && !productError && productData.length === 0 && (
              <Text textAlign="center" color="red.500" py={4} mt={10}>
                No products found. Please try another filter.
              </Text>
            )}

            {/* Product list */}
            {!isInitialLoading &&
              productData.map((product) => (
                <Box
                  mr={3}
                  key={product.node.id}
                  borderBottomWidth="1px"
                  borderColor="#EBEBEB"
                >
                  {/* Product row */}
                  <Flex
                    py={2}
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                    align="center"
                  >
                    <Checkbox
                      colorScheme="orange"
                      bg={"#FFFFFF"}
                      borderRadius={"2px"}
                      isChecked={isProductSelected(product.node.id)}
                      onChange={() => handleCheckboxChange(product.node)}
                      mr={3}
                      ml={1}
                      size={"md"}
                      id={`checkbox-${product.node.id}`}
                      sx={{
                        "& .chakra-checkbox__control": {
                          borderColor: "gray.200",
                          bg: "#FFFFFF",
                        },
                        "& .chakra-checkbox__control[data-checked]": {
                          bg: "#41ADBF",
                          borderColor: "#41ADBF",
                        },
                      }}
                    />
                    <FormLabel
                      htmlFor={`checkbox-${product.node.id}`}
                      display={"flex"}
                      alignItems={"center"}
                      width="100%"
                      margin="0"
                      cursor="pointer"
                    >
                      <Image
                        src={
                          product.node?.featuredMedia?.preview?.image
                            ?.transformedSrc || "/placeholder.svg"
                        }
                        alt={product.node.title}
                        boxSize="40px"
                        minW={"40px"}
                        maxW={"40px"}
                        borderRadius="sm"
                        mr={3}
                        bg="gray.100"
                      />
                      <Text fontSize="13px" fontWeight={500} noOfLines={1}>
                        {product.node.title}
                      </Text>
                    </FormLabel>
                  </Flex>

                  {/* Variants section (expandable) */}
                  <AnimatePresence initial={false}>
                    {expandedId === product.node.id &&
                      product?.node?.variants?.edges?.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <Box pl={8} p={2}>
                            {product?.node?.variants?.edges?.map((variant) => (
                              <Flex
                                key={`variant-${variant.node?.id}`}
                                align="center"
                                p={2}
                                py={3}
                                borderBottom="1px"
                                borderColor="#EBEBEB"
                              >
                                <Checkbox
                                  colorScheme="orange"
                                  bg={"#FFFFFF"}
                                  borderRadius={"2px"}
                                  isChecked={isVariantSelected(
                                    product.node.id,
                                    variant?.node?.id
                                  )}
                                  onChange={() =>
                                    toggleVariant(
                                      product.node.id,
                                      variant.node,
                                      variant?.node?.id
                                    )
                                  }
                                  mr={3}
                                  ml={1}
                                  size={"md"}
                                  id={`variant-${variant?.node?.id}`}
                                  sx={{
                                    "& .chakra-checkbox__control": {
                                      borderColor: "gray.200",
                                      bg: "#FFFFFF",
                                    },
                                    "& .chakra-checkbox__control[data-checked]":
                                      {
                                        bg: "#41ADBF",
                                        borderColor: "#41ADBF",
                                      },
                                  }}
                                />
                                <FormLabel
                                  htmlFor={`variant-${variant?.node?.id}`}
                                  width="100%"
                                  margin="0"
                                  cursor="pointer"
                                  display={"flex"}
                                  justifyContent={"space-between"}
                                  alignItems={"center"}
                                >
                                  <Text
                                    fontSize="12px"
                                    fontWeight={500}
                                    noOfLines={1}
                                  >
                                    {variant?.node?.displayName}
                                  </Text>
                                  <Text
                                    fontSize="12px"
                                    fontWeight={500}
                                    noOfLines={1}
                                  >
                                    {currencies[currencyCode]}
                                    {variant?.node?.price}
                                  </Text>
                                </FormLabel>
                              </Flex>
                            ))}
                          </Box>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </Box>
              ))}

            {/* Bottom loader for pagination */}
            {isPaginating && !isInitialLoading && (
              <Grid templateColumns="repeat(1fr)" gap={4} mr={3} mt={4}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <OcuProductModalLoader key={idx} />
                ))}
              </Grid>
            )}

            {/* End of results message */}
            {!isInitialLoading && productData.length > 0 && !hasNextPage && (
              <Text py={2} mt={2} color={"red.500"} textAlign={"center"}>
                No more products found
              </Text>
            )}
          </Box>
        </ModalBody>

        <ModalFooter
          p={4}
          borderTopWidth="1px"
          borderColor="gray.100"
          justifyContent="space-between"
          bg={"#F8F8F8"}
          borderBottomRadius="xl"
        >
          <HStack></HStack>
          <HStack spacing={2}>
            <CustomActionButton
              BgColor={"#EBEBEB"}
              TextColor={"#000000"}
              text={"Cancel"}
              HoverBgColor={"#D6D6D6"}
              HoverBgTextColor={"gray.800"}
              OnclickHandle={onClose}
            />
            <CustomActionButton
              BgColor={"#000000"}
              TextColor={"#FFFFFF"}
              text={"Add"}
              OnclickHandle={handleConfirm}
              isDisabled={selection.length === 0}
            />
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductsModalTest;
