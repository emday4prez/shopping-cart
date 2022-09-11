// simulate getting products from DataBase
let products = [
  { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if (item[0].instock == 0)return;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    item[0].instock = item[0].instock - 1;
    setCart([...cart, ...item]);
    //doFetch(query);
  };
  const deleteCartItem = (delIndex) => {
    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => index = delIndex)
    let newItems = items.map((item, index) => {
      if (item.name == target[0].name) item.instock++;
      return item;
    })
    setCart(newCart);
    setItems(newItems)
  };

  let list = items.map((item, index) => {
    let n = Math.floor(Math.random() * 1000)
    let uhit = "https://picsum.photos/id/" + n + "/50/50.jpg";

    return (
      <li key={index}>
        <Image src={uhit} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}:{item.cost}-stock={item.instock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
        {/* <Button name={item.name} variant='dark' size='small' onClick={addToCart}>add</Button> */}
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1+index} eventkey={1 + index}>
      <Accordion.Header>
        {item.name}
    
      </Accordion.Header>
      <Accordion.Body onClick={() => deleteCartItem(index)}
        eventkey={1 + index}>
        $ {item.cost} from {item.country}
          <Button onClick={deleteCartItem}>delete</Button>
      </Accordion.Body>
    </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {

    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
 const restockProducts = (url) => {
    doFetch(url);
    console.log(url)
    let newItems = data.data
    console.log('data.data',data.data) // The  whole list
    newItems.map((item) => {
      console.log(item.attributes.country) // Example of accessing a field
      let { name, country, cost, instock } = item.attributes;
      return { name, country, cost, instock };
    });
    console.log('newItems', newItems)
    setItems([...items, ...newItems]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
