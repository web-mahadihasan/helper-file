import { Box, Container, Grid, GridItem, Image } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import ConnectionLine from "../../../../assets/icons/ConnectionLine.png";
import ABTestContainer from "./ABTestContainer";
import ProductCardMain from "./ProductCardMain";
import { addUpsellProduct } from "../../../../features/ocuUpsellDataSlice";

export const line = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="507"
    height="72"
    viewBox="0 0 507 72"
    fill="none"
  >
    <path
      d="M241.238 6V38.5424M241.238 38.5424H6V66M241.238 38.5424H501V66"
      stroke="#41ADBF"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-dasharray="7 7"
    />
  </svg>
);

const UpsellAfterProductSelect = ({ upsellProduct }) => {
  const { upsell_one_product, upsell_two_product, downsell_product } =
    upsellProduct;
  const dispatch = useDispatch();

  const handleModalProductSelect = (updateProduct) => {
    // console.log(updateProduct)
    dispatch(addUpsellProduct(updateProduct));
  };

//   console.log("check all upsell", upsellProduct);

  return (
    <Container maxW="" py={6} px={["16px", "16px", "32px"]} h={"full"}>
      <Box h={"full"}>
        <Box
          w={["100%", "100%", "80%", "40%"]}
          mx={"auto"}
          position={"relative"}
          mb={"-2"}
        >
          {upsell_one_product?.ab_test_products ? (
            <ABTestContainer
              ABTestProducts={upsell_one_product?.ab_test_products}
              cardTitle={"upsell_one_product"}
            />
          ) : (
            <ProductCardMain
              products={upsell_one_product?.offer_products}
              showBadge={false}
              cardTitle={"upsell_one_product"}
              onModalProductSelect={handleModalProductSelect}
              modalSelectedProduct={upsell_one_product.offer_products || []}
              shortTitle={"Upsell 1"}
            />
          )}
        </Box>
        <Box
          display={"flex"}
          justifyContent={"center"}
          zIndex={30}
          position={"relative"}
        >
          <Image src={ConnectionLine} />
        </Box>

        <Grid
          w={["100%", "100%", "80%", "80%"]}
          mx={"auto"}
          templateColumns={["1fr", "1fr", "1fr", "repeat(2, 1fr)"]}
          gap={8}
          position={"relative"}
          mt={"-1.5"}
        >
          {/* Accept branch */}
          <GridItem w={"full"}>
            {upsell_two_product?.ab_test_products ? (
              <ABTestContainer
                ABTestProducts={upsell_two_product?.ab_test_products}
                cardTitle={"upsell_two_product"}
              />
            ) : (
              <ProductCardMain
                isAccept={true}
                showBadge={true}
                products={upsell_two_product?.offer_products}
                cardTitle={"upsell_two_product"}
                onModalProductSelect={handleModalProductSelect}
                modalSelectedProduct={upsell_two_product.offer_products || []}
                shortTitle={"Upsell 2"}
              />
            )}
          </GridItem>

          {/* Decline branch */}
          <GridItem w={"full"}>
            {downsell_product?.ab_test_products ? (
              <ABTestContainer
                ABTestProducts={downsell_product?.ab_test_products}
                cardTitle={"downsell_product"}
              />
            ) : (
              <ProductCardMain
                isAccept={false}
                showBadge={true}
                products={downsell_product?.offer_products}
                cardTitle={"downsell_product"}
                onModalProductSelect={handleModalProductSelect}
                modalSelectedProduct={downsell_product.offer_products || []}
                shortTitle={"Downsell 1"}
              />
            )}
          </GridItem>
        </Grid>
      </Box>
    </Container>
  );
};

export default UpsellAfterProductSelect;
