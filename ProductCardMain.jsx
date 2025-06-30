import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  ABTestingIcon,
  OcuDeleteIcon,
  OcuEditIcon,
} from "../../../../assets/icons/SVGIcons";
import {
  closeProductModal,
  openProductModal,
} from "../../../../features/ocuModalSlice";
import CreateUpsellMenuOptions from "./CreateUpsellMenuOptions";
import SingleProductCardBody from "./SingleProductCardBody";
import { useDispatch } from "react-redux";
import ProductsModal from "../ProductsModal";
import { useSelector } from "react-redux";
import AddUpsellOfferMenu from "./AddUpsellOfferMenu";
import ProductCardFooter from "./ProductCardFooter";
import MultipleProductCardBody from "./MultipleProductCardBody";
import {
  addABTestProduct,
  addAiGenerateProduct,
  removeUpsellProduct,
} from "../../../../features/ocuUpsellDataSlice";
import DeleteConfirmation from "../DeleteConfirmation";
import toast from "react-hot-toast";
import { useMemo } from "react";
import getDiscountForProducts from "../../essentials/getProductCardDiscount";

const ProductCardMain = ({
  products,
  isAccept,
  showBadge,
  cardTitle,
  onModalProductSelect,
  modalSelectedProduct,
  shortTitle,
  deleteTitle,
}) => {
  const dispatch = useDispatch();
  const { isProductModalOpen, currentModalId, modalData } = useSelector(
    (state) => state.ocuModal.productModalState
  );
  const isThisModalOpen = isProductModalOpen && currentModalId === cardTitle;
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  // const convertProduct = Object.assign({}, ...products);
  const ocuUpsellDiscount = useSelector((state) => state.ocuSettings.discount);

  const handleOpenProductModal = () => {
    console.log("clicked from product card");
    dispatch(
      openProductModal({
        modalId: cardTitle,
        data: {
          allowMultipleSelection: true,
          maxProductSelect: 5,
        },
      })
    );
  };
  // console.log('Discount value is here', ocuUpsellSetting)
  // Product update for redux store
  const updateModalSelectProduct = (selectProduct) => {
    const updateProduct = {
      upsellTitle: cardTitle,
      product: selectProduct,
    };
    // console.log(selectProduct)
    onModalProductSelect(updateProduct);
  };

  // Handle Remove Card Select product
  const handleProductRemove = () => {
    const deleteItem = {
      upsellTitle: cardTitle,
    };
    dispatch(removeUpsellProduct(deleteItem));
    toast.success("Product was delete successfully");
  };

  //Handle Ai Generate
  const handleAiGenerate = () => {
    dispatch(addAiGenerateProduct(cardTitle));
  };

  // Handle AB Test New offer
  const handleABTestProduct = (abTestProduct) => {
    const updateProduct = {
      upsellTitle: cardTitle,
      product: abTestProduct,
    };
    dispatch(addABTestProduct(updateProduct));
  };

  const discountData = useMemo(() => {
    return getDiscountForProducts(cardTitle, products, ocuUpsellDiscount);
  }, [cardTitle, products, ocuUpsellDiscount]);
  console.log(products, "products in card main");

  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="0px 1px 0px 0px rgba(26, 26, 26, 0.07), 1px 0px 0px 0px rgba(0, 0, 0, 0.13) inset, -1px 0px 0px 0px rgba(0, 0, 0, 0.13) inset, 0px -1px 0px 0px rgba(0, 0, 0, 0.17) inset, 0px 1px 0px 0px rgba(204, 204, 204, 0.50) inset"
      w="full"
      border={"1px"}
      borderColor={"#EBEBEB"}
    >
      <Flex
        p={3}
        py={3}
        bg={"#F8F8F8"}
        alignItems={"center"}
        justifyContent={"space-between"}
        borderTopRadius="xl"
      >
        <Box>
          {showBadge && (
            <Flex align="center" flexWrap={"wrap"}>
              <Text fontWeight="medium" mr={2}>
                If customer
              </Text>
              <Badge
                bg={`${isAccept ? "#BBE5B3" : "#FFC48B"}`}
                px={3}
                py={1}
                borderRadius="full"
                fontWeight={500}
                fontSize={"15px"}
                color={"#374144"}
                textTransform={"capitalize"}
              >
                {`${isAccept ? "Accepts Offer" : "Declines Offer"}`}
              </Badge>
            </Flex>
          )}
          <Text fontSize="sm" color="gray.500">
            {`${shortTitle} ${
              products[0]?.isAiGenerate
                ? "(Navidium AI Generated)"
                : products[0]?.isSameProductCart
                ? "(Dynamic)"
                : products.length > 0
                ? products.length > 1 &&
                  (!products[0]?.isSameProductCart || products[0]?.isAiGenerate)
                  ? "(Multiple)"
                  : "(Single)"
                : ""
            }`}
          </Text>
        </Box>
        {products.length > 0 && (
          <HStack>
            <Box>
              <AddUpsellOfferMenu
                onModalProductSelect={handleABTestProduct}
                cardTitle={cardTitle}
                products={products}
              />
            </Box>

            <Button
              p={2}
              bg={"#FFF"}
              borderRadius={"8px"}
              border={"1px"}
              borderColor={"#EBEBEB"}
              boxShadow={"0px 1px 1px 0px rgba(0, 0, 0, 0.10)"}
              isDisabled={
                products[0].node?.isAiGenerate ||
                products[0]?.node.isSameProductCart
              }
              onClick={handleOpenProductModal}
            >
              <Icon as={OcuEditIcon} mr={2} />
            </Button>
            <Button
              p={2}
              bg={"#FFF"}
              borderRadius={"8px"}
              border={"1px"}
              borderColor={"#EBEBEB"}
              boxShadow={"0px 1px 1px 0px rgba(0, 0, 0, 0.10)"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              onClick={onDeleteOpen}
            >
              <Icon as={OcuDeleteIcon} />
            </Button>
          </HStack>
        )}
      </Flex>

      <Box bg={"#FFF"} display={"flex"} alignItems={"center"} minH={"110px"}>
        {products.length > 0 ? (
          products.length > 1 ? (
            <MultipleProductCardBody
              products={products}
              showDropdownIcon={true}
              discountData={discountData}
            />
          ) : (
            <SingleProductCardBody
              product={products[0]}
              discountData={discountData}
            />
          )
        ) : (
          <CreateUpsellMenuOptions
            handleModalOpen={handleOpenProductModal}
            cardTitle={cardTitle}
            navidiumAiGenerate={handleAiGenerate}
          />
        )}
      </Box>

      <Stack px={4} bg={"#FFF"} borderBottomRadius={"xl"}>
        <ProductCardFooter cardTitle={cardTitle} />
      </Stack>

      {/* Product Modal  */}
      {isThisModalOpen && (
        <ProductsModal
          isOpen={true}
          onClose={() => dispatch(closeProductModal())}
          onProductsSelect={updateModalSelectProduct}
          allowMultipleSelection={modalData.allowMultipleSelection}
          maxProductSelect={modalData.maxProductSelect}
          selectedProducts={modalSelectedProduct}
        />
      )}

      {/* Delete Popup  */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onDelete={handleProductRemove}
        title={"Delete Products"}
        message="You can add it again later if needed. If you proceed, the data will be removed specifically for this trigger."
        confirmation="Are you sure you want to Delete?"
      />
    </Box>
  );
};

export default ProductCardMain;
