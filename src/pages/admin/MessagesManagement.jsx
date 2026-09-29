import { Avatar, Box, Skeleton, Stack } from "@mui/material";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/layout/AdminLayout";
import RenderAttachment from "../../components/shared/RenderAttachment";
import Table from "../../components/shared/Table";
import { server } from "../../constants/config";
import { fileFormat, transformImage } from "../../lib/features";
const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => {
      const { attachments } = params.row;
      return attachments?.length > 0
        ? attachments.map((each) => {
            const url = each.url;
            const file = fileFormat(url);
            return (
              <Box>
                <a
                  href={url}
                  download
                  target="_blank"
                  style={{
                    color: "black",
                  }}
                >
                  {RenderAttachment(file, url)}
                </a>
              </Box>
            );
          })
        : "No Attachments";
    },
  },
  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => (
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} />
        <span>{params.row.sender.name}</span>
      </Stack>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];
const MessageManagement = () => {
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
          `${server}/api/v1/admin/messages`,
          config,
        );

        if (data) {
          setRows(
            data.messages.map((each) => ({
              ...each,
              id: each._id,
              sender: {
                name: each.sender.name,
                avatar: transformImage(each.sender.avatar, 50),
              },

              createdAt: moment(each.createdAt).format(
                "MMMM Do YYYY, h:mm:ss a",
              ),
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
        <Table
          heading={"All Messages"}
          columns={columns}
          rows={rows}
          rowHeight={100}
        />
      )}
    </AdminLayout>
  );
};

export default MessageManagement;
