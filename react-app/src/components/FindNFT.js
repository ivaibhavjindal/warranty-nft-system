import axios from "axios";
import {
  Input,
  Button,
  Col,
  Form,
  DatePicker,
  Row,
  Switch,
  Upload,
  Typography,
  Image,
  Spin,
} from "antd";
import { useState } from "react";
import { getTokenUri } from "../services/contracts/warranty";
import NFTCard from "./NFTCard";
import NFTModal from "./NFTModal";

const FindNFT = ({ nftContract }) => {
  const [warrantyCard, setWarrantyCard] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState({});

  const onFinish = async (values) => {
    const tokenURI = await getTokenUri(nftContract, values.tokenId);
    console.log(tokenURI);

    const getDataFromTokenUriResponse = await axios.get(
      `https://ipfs.io/ipfs/${tokenURI.split("//")[1]}`
    );

    setWarrantyCard({
      token_id: values.tokenId,
      ...getDataFromTokenUriResponse.data,
    });
  };

  return (
    <Row>
      <Col span={10} offset={7}>
        {selectedNFT?.token_id >= 0 && (
          <NFTModal
            nftData={selectedNFT}
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
          />
        )}
        {!warrantyCard ? (
          <Form
            style={{
              margin: "2rem",
              padding: "2rem",
              background: "#fff",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              borderRadius: "2rem",
              boxShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
            name="mint warranty nft"
            onFinish={onFinish}
          >
            <Form.Item style={{ textAlign: "center" }}>
              <Typography.Title
                className="ant-form-text"
                level={4}
                style={{
                  textTransform: "uppercase",
                  fontFamily: "Roboto",
                }}
              >
                Warranty Card Details
              </Typography.Title>
            </Form.Item>

            <Form.Item name="tokenId" label="Token ID" required>
              <Input
                placeholder="Please input warranty card's token id"
                required
              />
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Get Warranty Card
            </Button>
          </Form>
        ) : (
          <div
            onClick={() => {
              setIsModalVisible(true);
              setSelectedNFT(warrantyCard);
              console.log("selected nft:", selectedNFT);
            }}
          >
            <NFTCard nftData={warrantyCard} />
          </div>
        )}
      </Col>
    </Row>
  );
};

export default FindNFT;
