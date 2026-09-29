import { Avatar, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";

import axios from "axios";
import { toast } from "react-hot-toast";
import { server } from "../../constants/config";
import { transformImage } from "../../lib/features";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => (
      <Avatar alt={params.row.name} src={params.row.avatar} />
    ),
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "username",
    headerName: "Username",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "friends",
    headerName: "Friends",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "groups",
    headerName: "Groups",
    headerClassName: "table-header",
    width: 200,
  },
];
const UserManagement = () => {
  const [rows, setRows] = useState([]);

  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const fetchData = async () => {
        setLoading(true);
        const { data } = await axios.get(
          `${server}/api/v1/admin/users`,
          config,
        );
        if (data) {
          setRows(
            data.users.map((each) => ({
              ...each,
              id: each._id,
              avatar: transformImage(each.avatar, 50),
            })),
          );
          setLoading(false);
        }
      };
      fetchData();
    } catch (error) {
      toast.error(error.data?.message);
    }
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton height={"100vh"} />
      ) : (
        <Table heading={"All Users"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
};

export default UserManagement;
