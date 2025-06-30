import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import navidiumAiProduct from "../../../../assets/img/navidiumAiProduct.png";
import { addUpsellProduct } from "../../../../features/ocuUpsellDataSlice";
import CreateUpsellDefaultPage from "./CreateUpsellDefaultPage";
import UpsellAfterProductSelect from "./UpsellAfterProductSelect";
// Main component
const CreateUpsellContainer = () => {
  const dispatch = useDispatch();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const storeUpsellProduct = useSelector(
    (state) => state.ocuUpsellData.upsell?.offer
  );

  // const handleNavidiumAIBuild = (title) => {
  //     console.log("click");
  //     const updateData = {
  //         upsellTitle: title,
  //         product: [
  //             {
  //                 isAiGenerate: true,
  //                 name: "AI generated product",
  //                 image: navidiumAiProduct,
  //                 id: 1,
  //             },
  //         ],
  //     };
  //     dispatch(addUpsellProduct(updateData));
  // };
  // // console.log(upsellProduct)
  return (
    <Box
      maxW="full"
      bg={"#FFFFFF"}
      border={"1px"}
      borderColor={"#EBEBEB"}
      borderRadius={"xl"}
    >
      <Box overflow="hidden">
        <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
          <Text fontSize={"17px"} fontWeight={500}>
            Create upsell
          </Text>
        </Box>

        {/* Create upsell box  */}
        <Box minHeight="450px" py={"50px"}>
          {storeUpsellProduct?.upsell_one_product?.offer_products?.length >
          0 ? (
            <UpsellAfterProductSelect upsellProduct={storeUpsellProduct} />
          ) : (
            <CreateUpsellDefaultPage  />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateUpsellContainer;
