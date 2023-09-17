import { useEffect, useState } from "react";
import alasql from "alasql";
import toast from "react-hot-toast";
import TABLE_NAMES from "../utils/constants";

const getURL = (name) =>
  `https://api.github.com/repos/graphql-compose/graphql-compose-examples/contents/examples/northwind/data/csv/${name}.csv`;

const useData = (tableName) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [runtime, setRuntime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [splitSize, setSplitSize] = useState([100, 0]);

  const convertToJson = (data) => {
    alasql
      .promise("SELECT * FROM CSV(?, {headers: false, separator:','})", [data])
      .then((data) => {
        setData(data);
        toast.success("Query run successfully");
      })
      .catch((e) => {
        toast.error(e.message);
      });
  };

  useEffect(() => {
    const fetchData = (tableName) => {
      setIsLoading(true);
      setData([]);
      const name = TABLE_NAMES.find((name) => name === tableName);
      if (name) {
        setError(false);
        fetch(getURL(tableName), {
          headers: {
            Accept: "application/vnd.github.v4+raw",
          },
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error("Something went wrong");
            }
          })
          .then((data) => convertToJson(atob(data.content.replace("\n", ""))))
          .catch((error) => {
            toast.error(error.message);
          });
          setIsLoading(false);
          setSplitSize([40, 60]);
      } else {
        setError(true);
        toast.error("Please enter a valid query");
      }
    };
    let t0 = performance.now(); 
    fetchData(tableName);
    let t1 = performance.now(); 
    setRuntime(t1 - t0);
  }, [tableName]);

  return { data, runtime, error, isLoading, splitSize, setSplitSize };
};

export default useData;