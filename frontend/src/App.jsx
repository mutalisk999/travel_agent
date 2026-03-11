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
    province: '',
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

  // 省份和城市数据
  const provinceCityMap = {
    '北京': ['北京'],
    '天津': ['天津'],
    '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
    '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
    '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
    '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
    '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边朝鲜族自治州'],
    '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '大兴安岭地区'],
    '上海': ['上海'],
    '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
    '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
    '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
    '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
    '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
    '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
    '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
    '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施土家族苗族自治州', '仙桃', '潜江', '天门', '神农架林区'],
    '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西土家族苗族自治州'],
    '广东': ['广州', '韶关', '深圳', '珠海', '汕头', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
    '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
    '海南': ['海口', '三亚', '三沙', '儋州', '五指山', '琼海', '文昌', '万宁', '东方', '定安', '屯昌', '澄迈', '临高', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'],
    '重庆': ['重庆'],
    '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
    '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
    '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
    '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
    '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
    '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏回族自治州', '甘南藏族自治州'],
    '青海': ['西宁', '海东', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
    '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
    '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区', '石河子', '阿拉尔', '图木舒克', '五家渠', '北屯', '铁门关', '双河', '可克达拉', '昆玉', '胡杨河', '新星']
  };

  // 省份列表
  const provinceOptions = Object.keys(provinceCityMap);

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
      
      // 只发送后端需要的字段，移除province字段
      const requestData = {
        user_type: formData.user_type,
        city: formData.city,
        preferences: formData.preferences,
        budget: parseInt(formData.budget),
        days: parseInt(formData.days)
      };
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8030'}/api/travel/plan`, requestData, {
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
    
    // 移除斜体标记（*text*）
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    
    // 移除标题符号（### text）
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    
    // 移除多余的标题符号（===）
    cleaned = cleaned.replace(/=+\s*=+/g, '');
    
    // 移除多余的代码块符号
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    
    // 移除行内代码标记（`text`）
    cleaned = cleaned.replace(/`(.*?)`/g, '$1');
    
    // 移除引用符号（> text）
    cleaned = cleaned.replace(/^>\s+/gm, '');
    
    // 移除水平线（---）
    cleaned = cleaned.replace(/^-+$/gm, '');
    
    // 移除表格标记
    cleaned = cleaned.replace(/\|.*?\|/g, '');
    
    // 移除链接标记（[text](url)）
    cleaned = cleaned.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
    
    // 移除图片标记（![alt](url)）
    cleaned = cleaned.replace(/!\[(.*?)\]\((.*?)\)/g, '');
    
    // 清理行首和行尾的空格
    cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
    
    return cleaned;
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          懒人旅游助手AI版【Demo】
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
            <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>省份</Typography>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <Select
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                displayEmpty
                inputProps={{ 'aria-label': '省份' }}
                sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <MenuItem value="" disabled>
                  请选择省份
                </MenuItem>
                {provinceOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" style={{ marginBottom: '8px', color: theme.palette.primary.dark, fontWeight: '600' }}>城市</Typography>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <Select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                displayEmpty
                inputProps={{ 'aria-label': '城市' }}
                sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <MenuItem value="" disabled>
                  请选择城市
                </MenuItem>
                {formData.province && provinceCityMap[formData.province].map(option => (
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
              <React.Fragment key={index}>
                <Paper style={{ padding: '1rem', margin: '0.5rem 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: '600' }}>第{day.day}天</Typography>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {day.activities}
                    </ReactMarkdown>
                  </div>

                </Paper>
                
                {/* 在两天之间插入酒店推荐和交通建议 */}
                {index < result.itinerary.length - 1 && (
                  <Paper style={{ padding: '1rem', margin: '0.5rem 0', backgroundColor: '#f0f7ff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: '600', marginBottom: '1rem' }}>第{day.day}晚 酒店安排</Typography>
                    {result.hotels && result.hotels.length > 0 ? (
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {`**酒店名称：** ${result.hotels[0].name || '暂无信息'}\n\n**位置：** ${result.hotels[0].location || '暂无信息'}\n\n**价格：** ${result.hotels[0].price || '暂无信息'}\n\n**特色：** ${result.hotels[0].features || '暂无信息'}\n\n**推荐理由：** ${result.hotels[0].reason || '暂无信息'}`}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <Typography variant="body2" color="textSecondary">暂无酒店推荐</Typography>
                    )}
                    
                    <Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>交通建议</Typography>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {`**城市内交通：** ${result.transportation.in_city || '暂无信息'}\n**景点间交通：** ${result.transportation.between_attractions || '暂无信息'}`}
                    </ReactMarkdown>
                  </Paper>
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* 显示完整的交通建议 */}
          <Box mb={3}>
            <Typography variant="h6" style={{ color: theme.palette.primary.main, fontWeight: '600', marginBottom: '1rem' }}>完整交通建议</Typography>
            <Paper style={{ padding: '1rem', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {`**到达城市：** ${result.transportation.to_city || '暂无信息'}\n**城市内交通：** ${result.transportation.in_city || '暂无信息'}\n**景点间交通：** ${result.transportation.between_attractions || '暂无信息'}\n**费用估算：** ${result.transportation.cost_estimate || '暂无信息'}`}
                </ReactMarkdown>
            </Paper>
          </Box>

          {/* 显示完整的酒店推荐 */}
          <Box>
            <Typography variant="h6" style={{ color: theme.palette.primary.main, fontWeight: '600', marginBottom: '1rem' }}>完整酒店推荐</Typography>
            {result.hotels && result.hotels.length > 0 ? (
              result.hotels.map((hotel, index) => (
                <Paper key={index} style={{ padding: '1rem', margin: '0.5rem 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: '600' }}>{hotel.name || '暂无名称'}</Typography>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {`**位置：** ${hotel.location || '暂无信息'}\n\n**价格：** ${hotel.price || '暂无信息'}\n\n**特色：** ${hotel.features || '暂无信息'}\n\n**推荐理由：** ${hotel.reason || '暂无信息'}`}
                    </ReactMarkdown>
                  </div>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">暂无酒店推荐</Typography>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  </ThemeProvider>
);
}

export default App;
