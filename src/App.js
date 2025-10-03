import "./App.css";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// https://huvddzgcnppozwfczztk.supabase.co/storage/v1/object/public/Images/403e023c-6640-4ed2-ada0-9f0650ed7b18/b18d3911-5f04-449c-bcd2-78afb5bc0b8a

const CDNURL =
  "https://huvddzgcnppozwfczztk.supabase.co/storage/v1/object/public/Images/";

// CDNURL + user.id + "/" + image name

function App() {
  const user = useUser();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [Images, setImages] = useState([]); // to store all images of user

  async function signInWithEmail() {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (error) {
      alert("Error got from supabase ,Please login with valid email");
      console.log(error);
    } else {
      alert("Check your email, we have sent you a magic link to login");
      console.log(data);
    }
  }

  async function getImages() {
    const { data, error } = await supabase.storage
      .from("Images") // bucket name
      .list(user?.id + "/", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      }); // user.id :- folder name

    if (data !== null) {
      setImages(data);
    } else {
      alert("Error getting images from supabase storage");
      console.log(error);
    }
  }

  async function uploadImage(e) {
    let file = e.target.files[0];

    const { data, error } = await supabase.storage
      .from("Images") // bucket name
      .upload(user.id + "/" + uuidv4(), file); // user.idv4() :- Generates random unique image name (unique string)

    if (error) {
      alert("Error uploading image to supabase storage");
      console.log(error);
    } else {
      getImages();
      console.log(data);
    }
  }

  return (
    <Container align="center" className="container-sm mt-5">
      {/*
              user not exist:-  Show then login page
              user exist :-  Show them images/ upload images page
          */}

      {user == null ? (
        <>
          <h1>Login page</h1>
          <Form>
            <Form.Group className="mb-3" style={{ maxWidth: "500px" }}>
              <Form.Label>Enter an Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={() => signInWithEmail()}>
              Get image link
            </Button>
          </Form>
        </>
      ) : (
        <>
          <h1>Image upload page</h1>
          <Button onClick={() => supabase.auth.signOut()}>Sign Out</Button>
          <p>Current User: {user.email}</p>

          <Form.Group className="mb-3" style={{ maxWidth: "500px" }}>
            <Form.Control
              type="file"
              accept="image/png , image/jpeg"
              onChange={(e) => uploadImage(e)}
            />
          </Form.Group>

          <hr />
          <h3>Your Images</h3>
          {/* Images:- [Image1, Image2,..] */}

          <Button variant="success" className="mb-3" onClick={getImages}>
            Get Images
          </Button>

          <Row>
            {Images.map((image) => (
              <Col key={image.name} md={4} className="mb-4">
                <Card>
                  <Card.Img
                    variant="top"
                    src={CDNURL + user.id + "/" + image.name}
                  />
                  <Card.Body>
                    <Card.Title>{image.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default App;
