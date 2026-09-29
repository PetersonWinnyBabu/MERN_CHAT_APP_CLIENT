import { Avatar, Skeleton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";

import axios from "axios";
import { toast } from "react-hot-toast";
import AvatarCard from "../../components/shared/AvatarCard";
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
    renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
  },
  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 300,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "totalMembers",
    headerName: "Total Members",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "members",
    headerName: "Members",
    headerClassName: "table-header",
    width: 400,
    renderCell: (params) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Total Messages",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "creator",
    headerName: "Created By",
    headerClassName: "table-header",
    width: 250,
    renderCell: (params) => (
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} />
        <span>{params.row.creator.name}</span>
      </Stack>
    ),
  },
];

const ChatManagement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    try {
      const fetchData = async () => {
        setLoading(true);
        const { data } = await axios.get(
          `${server}/api/v1/admin/chats`,
          config,
        );
        if (data) {
          setRows(
            data?.transformedChats.map((each) => ({
              ...each,
              id: each._id,
              avatar: each.avatar.map((i) => transformImage(i, 50)),
              members: each.members.map((i) => transformImage(i.avatar, 50)),
              creator: {
                name: each.creator.name,
                avatar: transformImage(each.creator.avatar, 50),
              },
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
  // useEffect(() => {
  //   setRows(
  //     sampleDashboardData.chats.map((each) => ({
  //       ...each,
  //       id: each._id,
  //       avatar: each.avatar.map((i) => transformImage(i, 50)),
  //       members: each.members.map((i) => transformImage(i.avatar, 50)),
  //       creator: {
  //         name: each.creator.name,
  //         avatar: transformImage(each.creator.avatar, 50),
  //       },
  //     })),
  //   );
  // }, []);
  return (
    <AdminLayout>
      {loading ? (
        <Skeleton height={"100vh"} />
      ) : (
        <Table heading={"All Chats"} columns={columns} rows={rows} />
      )}
    </AdminLayout>
  );
};

export default ChatManagement;
