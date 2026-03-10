import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Container, TextField, Button, MenuItem, FormControl, Select, Checkbox, FormControlLabel, Box, Typography, Paper, Alert, LinearProgress, Grid, ThemeProvider, createTheme } from '@mui/material';

// 创建旅游主题的MUI主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // 蓝色，代表海洋、天空
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#4caf50', // 绿色，代表自然、森林
      light: '#81c784',
      dark: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '16px',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

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
    // 按人群/关系
    { value: '闺蜜结伴游', label: '闺蜜结伴游' },
    { value: '兄弟结伴游', label: '兄弟结伴游' },
    { value: '情侣蜜月游', label: '情侣蜜月游' },
    { value: '轻度假情侣游', label: '轻度假情侣游' },
    { value: '单身社交游', label: '单身社交游' },
    { value: '毕业旅行', label: '毕业旅行' },
    { value: '家庭轻度假游', label: '家庭轻度假游' },
    { value: '独自旅行', label: '独自旅行' },
    
    // 按玩法/强度
    { value: '大学生特种兵游', label: '大学生特种兵游' },
    { value: '躺平式旅游', label: '躺平式旅游/摆烂游' },
    { value: 'Citywalk城市漫游', label: 'Citywalk 城市漫游' },
    { value: '轻徒步游', label: '轻徒步/山野徒步游' },
    { value: '骑行游', label: '骑行游' },
    { value: '自驾环线游', label: '自驾环线游' },
    { value: '露营野奢游', label: '露营野奢游' },
    { value: '赶海游', label: '赶海游' },
    { value: '夜爬看日出游', label: '夜爬看日出游' },
    
    // 按目的/主题
    { value: '美食探店游', label: '美食探店游' },
    { value: '追星看展音乐节游', label: '追星/看展/音乐节游' },
    { value: '摄影采风游', label: '摄影采风游' },
    { value: '汉服古风体验游', label: '汉服/古风体验游' },
    { value: '非遗文化游', label: '非遗文化游' },
    { value: '研学游', label: '研学游' },
    { value: '疗愈放松游', label: '疗愈放松游' },
    { value: '运动专项游', label: '滑雪/冲浪/潜水等运动专项游' },
    { value: '小众秘境游', label: '小众秘境游' },
    { value: '乡村旅居游', label: '乡村旅居游' },
    
    // 按消费/风格
    { value: '穷游', label: '穷游/低成本旅行' },
    { value: '轻奢度假游', label: '轻奢度假游' },
    { value: '高端定制游', label: '高端定制游' },
    { value: '旅居式旅行', label: '旅居式旅行' },
    { value: '短途微度假', label: '短途微度假' },
    { value: '遛娃亲子游', label: '遛娃亲子游' },
    { value: '同事团建游', label: '同事团建游' },
    { value: '老年人夕阳游', label: '老年人夕阳游' }
  ];

  const cityOptions = [
    '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '南京', '武汉',
    '苏州', '厦门', '青岛', '大连', '天津', '长沙', '沈阳', '哈尔滨', '济南', '福州',
    '昆明', '南宁', '贵阳', '南昌', '合肥', '太原', '石家庄', '兰州', '西宁', '银川',
    '乌鲁木齐', '拉萨', '海口', '三亚', '珠海', '汕头', '东莞', '佛山', '惠州', '中山',
    '泉州', '漳州', '莆田', '宁德', '温州', '宁波', '嘉兴', '湖州', '绍兴', '金华',
    '衢州', '台州', '丽水', '无锡', '常州', '徐州', '南通', '连云港', '淮安', '盐城',
    '扬州', '镇江', '泰州', '宿迁', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵',
    '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'
  ];

  const preferenceOptions = [
    // 体验型偏好
    '美食探店',
    '温泉/康养/疗愈',
    '户外探险',
    '运动专项',
    '休闲度假',
    '住宿体验',
    
    // 兴趣主题型偏好
    '摄影采风',
    '文博看展',
    '演出/音乐节/赛事',
    '动漫/影视IP巡礼',
    '自驾环线',
    '城市漫游',
    
    // 目的/方式型偏好
    '短途微度假',
    '深度慢游',
    '小众秘境',
    '研学/求知',
    '亲子陪伴',
    '社交结伴',
    
    // 生活方式型偏好
    '乡村田园',
    '海边/海岛度假',
    '都市商圈购物',
    '禅修/静心',
    '旅居生活',
    
    // 原有偏好
    '自然风光',
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
      // 验证旅游天数不超过8天
      let processedValue = value;
      if (name === 'days' && value > 8) {
        processedValue = '8';
      }
      // 验证人均预算不超过10000元
      if (name === 'budget' && value > 10000) {
        processedValue = '10000';
      }
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // 验证旅游天数不超过8天
      if (parseInt(formData.days) > 8) {
        setError('旅游天数不能超过8天');
        setLoading(false);
        return;
      }
      
      // 验证人均预算不超过10000元
      if (parseInt(formData.budget) > 10000) {
        setError('人均预算每天不能超过10000元');
        setLoading(false);
        return;
      }
      
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
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          AI旅游助手
        </Typography>
        
        <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>旅游类型</Typography>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <Select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  required
                  displayEmpty
                  inputProps={{ 'aria-label': '旅游类型' }}
                  sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                  <MenuItem value="" disabled>
                    请选择旅游类型
                  </MenuItem>
                  {userTypes.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>旅游偏好</Typography>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Grid container spacing={2}>
                  {preferenceOptions.map((option, index) => (
                    <Grid item xs={6} sm={4} md={3} key={option}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="preferences"
                            value={option}
                            checked={formData.preferences.includes(option)}
                            onChange={handleChange}
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                          />
                        }
                        label={option}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>旅游城市</Typography>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <Select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                displayEmpty
                inputProps={{ 'aria-label': '旅游城市' }}
                sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <MenuItem value="" disabled>
                  请选择旅游城市
                </MenuItem>
                {cityOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>旅游天数</Typography>
            <TextField
              fullWidth
              name="days"
              type="number"
              min="1"
              max="8"
              value={formData.days}
              onChange={handleChange}
              required
              placeholder="请输入旅游天数"
              helperText="旅游天数最多不能超过8天"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>人均预算（元）</Typography>
            <TextField
              fullWidth
              name="budget"
              type="number"
              min="1"
              max="10000"
              value={formData.budget}
              onChange={handleChange}
              required
              placeholder="请输入人均预算"
              helperText="人均预算每天不超过10000元"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ marginTop: '1rem', padding: '12px', fontSize: '16px', fontWeight: '600' }}
          >
            {loading ? '生成中...' : '生成旅游计划'}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" style={{ marginBottom: '2rem', borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.primary.dark, fontWeight: '600' }}>
            正在生成旅游计划...
          </Typography>
          <Typography variant="body1" style={{ marginBottom: '1rem', color: theme.palette.primary.main }}>
            生成时间可能会比较久，请耐心等待
          </Typography>
          <LinearProgress sx={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(63, 81, 181, 0.2)', '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main } }} />
        </Paper>
      )}

      {result && (
        <Paper elevation={3} style={{ padding: '2rem', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <Typography variant="h5" gutterBottom style={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>
            旅游计划
          </Typography>
          
          <Box mb={3}>
            <Typography variant="h6" style={{ color: theme.palette.primary.main, fontWeight: '600', marginBottom: '1rem' }}>行程安排</Typography>
            {result.itinerary.map((day, index) => (
              <Paper key={index} style={{ padding: '1rem', margin: '0.5rem 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: '600' }}>第{day.day}天</Typography>
                <div style={{ marginTop: '0.5rem' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanMarkdown(day.activities)}
                  </ReactMarkdown>
                </div>
              </Paper>
            ))}
          </Box>

          <Box mb={3}>
            <Typography variant="h6" style={{ color: theme.palette.primary.main, fontWeight: '600', marginBottom: '1rem' }}>酒店推荐</Typography>
            {result.hotels && result.hotels.length > 0 ? (
              result.hotels.map((hotel, index) => (
                <Paper key={index} style={{ padding: '1rem', margin: '0.5rem 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: '600' }}>{hotel.name || '暂无名称'}</Typography>
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
            <Typography variant="h6" style={{ color: theme.palette.primary.main, fontWeight: '600', marginBottom: '1rem' }}>交通建议</Typography>
            <Paper style={{ padding: '1rem', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanMarkdown(`**到达城市：** ${result.transportation.to_city || '暂无信息'}\n\n**城市内交通：** ${result.transportation.in_city || '暂无信息'}\n\n**景点间交通：** ${result.transportation.between_attractions || '暂无信息'}\n\n**费用估算：** ${result.transportation.cost_estimate || '暂无信息'}`)}
              </ReactMarkdown>
            </Paper>
          </Box>
        </Paper>
      )}
    </Container>
  </ThemeProvider>
);
}

export default App;
