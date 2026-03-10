import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Container, TextField, Button, MenuItem, FormControl, Select, InputLabel, Checkbox, FormControlLabel, Box, Typography, Paper, Alert, LinearProgress } from '@mui/material';

function App() {
  const [formData, setFormData] = useState({
    user_type: '',
    city: '',
    preferences: [],
    budget: '',
    days: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userTypes = [
    { value: '大学生特种兵游', label: '大学生特种兵游' },
    { value: '遛娃亲子游', label: '遛娃亲子游' },
    { value: '同事团建游', label: '同事团建游' },
    { value: '老年人夕阳游', label: '老年人夕阳游' }
  ];

  const preferenceOptions = [
    '自然风光',
    '海边',
    '历史人文景观',
    '民俗风土人情',
    '网红打卡'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        preferences: checked
          ? [...prev.preferences, value]
          : prev.preferences.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/travel/plan', formData, {
        timeout: 600000
      });
      setResult(response.data);
    } catch (err) {
      setError('生成旅游计划失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 清理Markdown内容，移除多余的格式字符
  const cleanMarkdown = (text) => {
    if (!text) return '暂无内容';
    
    let cleaned = text;
    
    // 移除多余的换行和空格
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    // 确保列表格式正确
    cleaned = cleaned.replace(/^-\s+/gm, '- ');
    
    // 移除多余的星号（**）
    cleaned = cleaned.replace(/\*\*\s*\*\*/g, '');
    
    // 移除多余的标题符号（===）
    cleaned = cleaned.replace(/=+\s*=+/g, '');
    
    // 移除多余的代码块符号
    cleaned = cleaned.replace(/```\s*```/g, '');
    
    // 清理行首和行尾的空格
    cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
    
    return cleaned;
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" align="center" gutterBottom>
        AI旅游助手
      </Typography>
      
      <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <FormControl fullWidth>
              <InputLabel id="user-type-label">旅游类型</InputLabel>
              <Select
                labelId="user-type-label"
                name="user_type"
                value={formData.user_type}
                label="旅游类型"
                onChange={handleChange}
                required
              >
                {userTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="旅游城市"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1">旅游偏好</Typography>
            {preferenceOptions.map(option => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    name="preferences"
                    value={option}
                    checked={formData.preferences.includes(option)}
                    onChange={handleChange}
                  />
                }
                label={option}
              />
            ))}
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="人均预算（元）"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              required
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="旅游天数"
              name="days"
              type="number"
              value={formData.days}
              onChange={handleChange}
              required
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? '生成中...' : '生成旅游计划'}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" style={{ marginBottom: '2rem' }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem' }}>
          <Typography variant="h6" gutterBottom>
            正在生成旅游计划...
          </Typography>
          <LinearProgress />
        </Paper>
      )}

      {result && (
        <Paper elevation={3} style={{ padding: '2rem' }}>
          <Typography variant="h5" gutterBottom>
            旅游计划
          </Typography>
          
          <Box mb={3}>
            <Typography variant="h6">行程安排</Typography>
            {result.itinerary.map((day, index) => (
              <Paper key={index} style={{ padding: '1rem', margin: '0.5rem 0' }}>
                <Typography variant="subtitle1">第{day.day}天</Typography>
                <div style={{ marginTop: '0.5rem' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanMarkdown(day.activities)}
                  </ReactMarkdown>
                </div>
              </Paper>
            ))}
          </Box>

          <Box mb={3}>
            <Typography variant="h6">酒店推荐</Typography>
            {result.hotels && result.hotels.length > 0 ? (
              result.hotels.map((hotel, index) => (
                <Paper key={index} style={{ padding: '1rem', margin: '0.5rem 0' }}>
                  <Typography variant="subtitle1">{hotel.name || '暂无名称'}</Typography>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {cleanMarkdown(`**位置：** ${hotel.location || '暂无信息'}\n\n**价格：** ${hotel.price || '暂无信息'}\n\n**特色：** ${hotel.features || '暂无信息'}\n\n**推荐理由：** ${hotel.reason || '暂无信息'}`)}
                    </ReactMarkdown>
                  </div>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">暂无酒店推荐</Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h6">交通建议</Typography>
            <Paper style={{ padding: '1rem' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanMarkdown(`**到达城市：** ${result.transportation.to_city || '暂无信息'}\n\n**城市内交通：** ${result.transportation.in_city || '暂无信息'}\n\n**景点间交通：** ${result.transportation.between_attractions || '暂无信息'}\n\n**费用估算：** ${result.transportation.cost_estimate || '暂无信息'}`)}
              </ReactMarkdown>
            </Paper>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default App;
