import { useState } from "react";
import {
  Row,
  Col,
  Form,
  Typography,
  Upload,
  Input,
  Button,
  Image,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

import Loader from "./Loader";
import showNotification from "../utilities/notifications";
import { sendContractMail } from "../services/mailer/contractMail";

const CreateContract = ({ ipfsClient, factoryContract }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageIPFS, setImageIPFS] = useState(null);

  const mintContract = async (
    contractName,
    contractSymbol,
    tokenURI,
    email
  ) => {
    console.log("Minting contract");

    console.log(contractName);
    console.log(contractSymbol);
    console.log(tokenURI);

    const contractTxn = await factoryContract.createNewWarrantyContract(
      contractName,
      contractSymbol,
      tokenURI
    );

    await contractTxn.wait();

    if (contractTxn.hash) {
      showNotification(
        "Contract Minted successfully!",
        "success",
        `Contract Trasnaction Hash: ${contractTxn.hash}`
      );
      sendContractMail(email, contractTxn.hash);
      setImageIPFS(null);
      setIsLoading(false);
    }
  };

  const handleImageUpload = (options) => {
    const { onSuccess, onError, file } = options;
    try {
      setIsImageLoading(true);
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        let buffer = e.target.result;
        try {
          const upload = async () => {
            console.log("ipfs client ", ipfsClient);
            if (ipfsClient && buffer) {
              const result = await ipfsClient.add(buffer);

              if (result && result.path) {
                console.log(result, result.path);
                setImageIPFS(result.path);
              }
            }
          };

          upload().then((result) => {
            setIsImageLoading(false);
          });
        } catch (err) {
          setIsImageLoading(false);
          console.log("err", err);
        }
      };
      onSuccess(true);
      return true;
    } catch (err) {
      setIsImageLoading(false);
      onError(true);
      return false;
    }
  };

  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      if (imageIPFS) {
        const tokenUri = `ipfs://${imageIPFS}`;
        console.log(tokenUri);
        mintContract(
          values.contractName,
          values.contractSymbol,
          tokenUri,
          values.email
        ).then((res) => window.location.reload());
      }
    } catch (err) {
      showNotification(err.message, "error");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Row>
        <Col span={10} offset={7}>
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
            name="mint warranty contract"
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
                Contract Details
              </Typography.Title>
            </Form.Item>

            <Form.Item
              name="email"
              label="Brand Email"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Please input brand email address" />
            </Form.Item>

            <Form.Item
              name="contractName"
              label="Brand Name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Please input brand name" />
            </Form.Item>

            <Form.Item
              name="contractSymbol"
              label="Brand Symbol"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Please input brand symbol/logo" />
            </Form.Item>

            <Form.Item label="Brand Image">
              <Form.Item
                name="brandImage"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
              >
                <Upload.Dragger
                  showUploadList={false}
                  accept=".png,.jpeg,.jpg,.svg"
                  customRequest={handleImageUpload}
                  name="files"
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <Typography.Text className="ant-upload-text">
                    Click or Drag File to this Area to Upload
                  </Typography.Text>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
            {isImageLoading && <Spin />}
            {imageIPFS && (
              <Image
                height={200}
                src={`https://ipfs.io/ipfs/${imageIPFS}`}
                alt="uploaded image"
              />
            )}
            <Button type="primary" htmlType="submit" disabled={!imageIPFS}>
              Generate Contract
            </Button>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default CreateContract;
