import React, { createRef, useEffect, useState } from 'react';
import FormAdd from 'components/TimeFrame/FormAdd';
import moment from 'moment';
import { Row, Col, Table, Tooltip, Button, notification, Popconfirm, Card, Breadcrumb } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { timeFrameState$ } from 'redux/selectors';
import * as timeFrameActions from 'redux/actions/timeFrames';
import FormEdit from 'components/TimeFrame/FormEdit';
import style from './index.module.less';
const TimeFrame = () => {
  const columns = [
    {
      key: 'id',
      title: 'No.',
      align: 'center',
      render: (record, value, index) => <span>{index + (currentPage - 1) * pageSize + 1}</span>,
    },
    {
      key: 'start',
      title: 'Start Time',
      dataIndex: 'startingTime',
      defaultSortOrder: 'ascend',
      sorter: (a, b) =>
        Date.parse(`2/4/2000 ${a.startingTime}`) - Date.parse(`2/4/2000 ${b.startingTime}`),
      render: value => {
        return <span>{value.slice(0, value.length - 3)}</span>;
      },
      align: 'center',
    },
    {
      key: '-',
      align: 'center',
      render: () => <span>-</span>,
    },
    {
      key: 'end',
      title: 'End time',
      dataIndex: 'endingTime',
      sorter: (a, b) =>
        Date.parse(`2/4/2000 ${a.endingTime}`) - Date.parse(`2/4/2000 ${b.endingTime}`),
      render: value => {
        return <span>{value.slice(0, value.length - 3)}</span>;
      },
      align: 'center',
    },
    {
      title: '',
      align: 'center',
      render: record => {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Tooltip title="Edit information">
              <Button
                type="primary"
                ghost
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEdit(true);
                  setIdRecordEdited(record);
                }}
              />
            </Tooltip>
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.idTimeFrame)}>
              <Tooltip title="Delete">
                <Button danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [recordEdited, setIdRecordEdited] = useState({});
  const dispatch = useDispatch();
  const timeFrames = useSelector(timeFrameState$);
  const formRef = createRef();

  useEffect(() => {
    dispatch(timeFrameActions.getAllTimeFrames.getAllTimeFramesRequest());
  }, []);

  //Set data source
  useEffect(() => {
    setDataSource(timeFrames.data);
    if (timeFrames.isLoading && timeFrames.error.length > 0) {
      notification.error({
        message: timeFrames.error,
      });
    }
  }, [timeFrames]);

  //Notification success
  useEffect(() => {
    if (timeFrames.isSuccess) {
      notification.success({
        message: 'Successfully!',
      });
    }
  }, [timeFrames.isLoading]);

  //reset form add
  useEffect(() => {
    formRef.current.resetFields();
  }, [timeFrames.data]);
  //Add
  const handleAddTimeFrames = values => {
    const newTimeFrames = [];
    let isExist = false;
    for (var i = 0; i < values.timeFrames.length; ++i) {
      const item = values.timeFrames[i];
      const start = moment(item.time[0]).format('HH:mm');
      const end = moment(item.time[1]).format('HH:mm');
      const tmp = { startingTime: start, endingTime: end };
      const exist = newTimeFrames.find(
        element => element.startingTime === start && element.endingTime === end
      );
      if (!exist) {
        newTimeFrames.push(tmp);
      } else {
        isExist = true;
      }
    }
    if (isExist) {
      notification.error({
        message: `Cant't add time frame!`,
        description: 'There are two same time frames while adding',
      });
    } else {
      dispatch(timeFrameActions.createTimeFrame.createTimeFrameRequest(newTimeFrames));
    }
  };

  //Delete
  const handleDelete = idTimeFrame => {
    const tmp = dataSource.filter(item => item.idTimeFrame != idTimeFrame);
    setDataSource(tmp);
    dispatch(timeFrameActions.deleteTimeFrame.deleteTimeFrameRequest(idTimeFrame));
  };

  //Update
  const handleUpdate = value => {
    const start = moment(value.timeFrame[0]).format('HH:mm');
    const end = moment(value.timeFrame[1]).format('HH:mm');
    const tmp = { idTimeFrame: recordEdited.idTimeFrame, startingTime: start, endingTime: end };
    dispatch(timeFrameActions.updateTimeFrame.updateTimeFrameRequest(tmp));
    setIsEdit(false);
  };
  return (
    <Col span={24}>
      <Breadcrumb style={{ marginBottom: '10px' }}>
        <Breadcrumb.Item>
          <a href="/">Dashboard</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Time frame</Breadcrumb.Item>
      </Breadcrumb>
      <h2 className={style.title}>Time frame list</h2>
      <Row gutter={50}>
        <Col span={16}>
          <Card>
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={timeFrames.isLoading}
              pagination={{
                showSizeChanger: true,
                current: currentPage,
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                },
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {isEdit && (
              <FormEdit onSave={handleUpdate} record={recordEdited} onCancel={setIsEdit} />
            )}
            {!isEdit && <FormAdd onSave={handleAddTimeFrames} formRef={formRef} />}
          </Card>
        </Col>
      </Row>
    </Col>
  );
};

export default TimeFrame;