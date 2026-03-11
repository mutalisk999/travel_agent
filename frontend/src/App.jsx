import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  ThemeProvider,
  createTheme,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
      dark: '#1565c0',
      light: '#64b5f6'
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    },
    text: {
      primary: '#263238',
      secondary: '#607d8b'
    }
  },
  typography: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
      color: '#1e88e5'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.25px',
      lineHeight: 1.3,
      color: '#1565c0'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.375rem',
      letterSpacing: '-0.1px',
      lineHeight: 1.4,
      color: '#1e88e5'
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '0.1px',
      lineHeight: 1.5,
      color: '#263238'
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '1rem',
      letterSpacing: '0.1px',
      lineHeight: 1.5,
      color: '#455a64'
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#37474f'
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#546e7a'
    },
    button: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '0.5px',
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.1)',
    '0 4px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.14)',
    '0 12px 32px rgba(0,0,0,0.16)',
    '0 16px 40px rgba(0,0,0,0.18)',
    '0 20px 48px rgba(0,0,0,0.2)',
    '0 24px 56px rgba(0,0,0,0.22)',
    '0 28px 64px rgba(0,0,0,0.24)',
    '0 32px 72px rgba(0,0,0,0.26)',
    '0 36px 80px rgba(0,0,0,0.28)',
    '0 40px 88px rgba(0,0,0,0.3)',
    '0 44px 96px rgba(0,0,0,0.32)',
    '0 48px 104px rgba(0,0,0,0.34)',
    '0 52px 112px rgba(0,0,0,0.36)',
    '0 56px 120px rgba(0,0,0,0.38)',
    '0 60px 128px rgba(0,0,0,0.4)',
    '0 64px 136px rgba(0,0,0,0.42)',
    '0 68px 144px rgba(0,0,0,0.44)',
    '0 72px 152px rgba(0,0,0,0.46)',
    '0 76px 160px rgba(0,0,0,0.48)',
    '0 80px 168px rgba(0,0,0,0.5)',
    '0 84px 176px rgba(0,0,0,0.52)',
    '0 88px 184px rgba(0,0,0,0.54)',
    '0 92px 192px rgba(0,0,0,0.56)'
  ]
});

function App() {
  const [formData, setFormData] = useState({
    user_type: '',
    departure_province: '',
    departure_city: '',
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
    { value: '情侣浪漫游', label: '情侣浪漫游' },
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
    
    // 按主题/目的
    { value: '美食探店游', label: '美食探店游' },
    { value: '摄影采风游', label: '摄影采风游' },
    { value: '文博看展游', label: '文博看展游' },
    { value: '演出音乐节游', label: '演出/音乐节/赛事游' },
    { value: '动漫影视IP游', label: '动漫/影视IP巡礼游' },
    
    // 按预算/时长
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
    '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店'],
    '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施土家族苗族自治州'],
    '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西土家族苗族自治州'],
    '广东': ['广州', '韶关', '深圳', '珠海', '汕头', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
    '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
    '海南': ['海口', '三亚', '三沙', '儋州', '五指山', '琼海', '文昌', '万宁', '东方', '定安', '屯昌', '澄迈', '临高', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'],
    '重庆': ['重庆'],
    '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
    '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
    '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
    '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里地区'],
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
    '购物逛街',
    '温泉SPA',
    '酒吧夜生活',
    '户外运动',
    '自然风光',
    '海边',
    '历史人文景观',
    '民俗风土人情',
    
    // 兴趣型偏好
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
      // 验证人均总预算不超过50000元
      if (name === 'budget' && value > 50000) {
        processedValue = '50000';
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
      
      // 验证人均总预算不超过50000元
      if (parseInt(formData.budget) > 50000) {
        setError('人均总预算不能超过50000元');
        setLoading(false);
        return;
      }
      
      // 发送后端需要的字段，包含出发地信息
      const requestData = {
        user_type: formData.user_type,
        departure_city: formData.departure_city,
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
    
    // 确保传入的是字符串
    if (typeof text !== 'string') {
      text = String(text);
    }
    
    let cleaned = text;
    
    // 移除多余的换行和空格
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    // 确保列表格式正确
    cleaned = cleaned.replace(/^-\s+/gm, '- ');
    
    // 移除多余的星号（**）
    cleaned = cleaned.replace(/\*\*\s*\*\*/g, '');
    
    // 移除斜体标记（*text*）
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    
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
        <Typography variant="h4" align="center" gutterBottom>
          懒人旅游助手AI版【Demo】
        </Typography>
        
        <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <form onSubmit={handleSubmit}>

            <Box mb={2}>
              <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>出发地</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                    <Typography variant="body2" style={{ marginBottom: '4px' }}>出发省份</Typography>
                    <Select
                      name="departure_province"
                      value={formData.departure_province}
                      onChange={handleChange}
                      required
                      displayEmpty
                      inputProps={{ 'aria-label': '出发省份' }}
                      sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      <MenuItem value="" disabled>
                        请选择出发省份
                      </MenuItem>
                      {provinceOptions.map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                    <Typography variant="body2" style={{ marginBottom: '4px' }}>出发城市</Typography>
                    <Select
                      name="departure_city"
                      value={formData.departure_city}
                      onChange={handleChange}
                      required
                      displayEmpty
                      inputProps={{ 'aria-label': '出发城市' }}
                      sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      <MenuItem value="" disabled>
                        请选择出发城市
                      </MenuItem>
                      {formData.departure_province && provinceCityMap[formData.departure_province].map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>目的地</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                    <Typography variant="body2" style={{ marginBottom: '4px' }}>目标省份</Typography>
                    <Select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      displayEmpty
                      inputProps={{ 'aria-label': '目标省份' }}
                      sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      <MenuItem value="" disabled>
                      请选择目标省份
                    </MenuItem>
                      {provinceOptions.map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                    <Typography variant="body2" style={{ marginBottom: '4px' }}>目标城市</Typography>
                    <Select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      displayEmpty
                      inputProps={{ 'aria-label': '目标城市' }}
                      sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      <MenuItem value="" disabled>
                      请选择目标城市
                    </MenuItem>
                      {formData.province && provinceCityMap[formData.province].map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>行程信息</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <Typography variant="body2" style={{ marginBottom: '4px' }}>旅游天数</Typography>
                    <TextField
                      name="days"
                      type="number"
                      min="1"
                      max="8"
                      value={formData.days}
                      onChange={handleChange}
                      required
                      placeholder="请输入天数"
                      helperText="最多8天"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <Typography variant="body2" style={{ marginBottom: '4px' }}>人均总预算（元）</Typography>
                    <TextField
                      name="budget"
                      type="number"
                      min="1"
                      max="50000"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      placeholder="请输入预算"
                      helperText="人均总预算不能超过50000元"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

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
                            color="primary"
                          />
                        }
                        label={option}
                      />
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              style={{
                marginTop: '1rem',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              }}
            >
              {loading ? '生成中...' : '生成旅游计划'}
            </Button>
          </form>
        </Paper>

        {loading && (
          <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress size={60} thickness={4} style={{ color: theme.palette.primary.main, marginBottom: '1rem' }} />
              <Typography variant="h6" style={{ color: theme.palette.primary.dark, fontWeight: 'bold', marginBottom: '0.5rem' }}>
                正在生成您的旅游计划...
              </Typography>
              <Typography variant="body1" style={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
                由于需要调用AI模型进行智能规划，生成时间可能会稍长一些，请耐心等待
              </Typography>
              <Typography variant="body2" style={{ color: theme.palette.text.secondary, textAlign: 'center', marginTop: '0.5rem' }}>
                我们正在为您规划从{formData.departure_city || '出发地'}到{formData.city || '目的地'}的{formData.days || ''}天精彩旅程
              </Typography>
            </Box>
          </Paper>
        )}

        {error && (
          <Paper elevation={2} style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {result && !loading && (
          <Paper elevation={3} style={{ padding: '2rem', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
            <Typography variant="h5" gutterBottom>
              您的个性化旅游计划
            </Typography>
            
            {/* 行程安排 */}
            <Typography variant="h6" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              行程安排
            </Typography>
            <Paper elevation={1} style={{ padding: '1rem', backgroundColor: 'white', marginBottom: '1rem' }}>
              {result.itinerary && Array.isArray(result.itinerary) && result.itinerary.length > 0 ? (
                  result.itinerary.map((day, index) => {
                    console.log('Day data:', day);
                    console.log('Activities:', day?.activities);
                    console.log('Is activities array?', Array.isArray(day?.activities));
                    return (
                      <div key={index} style={{ marginBottom: '1rem' }}>
                        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                          第{day?.day || index + 1}天
                        </Typography>
                        {day?.activities ? (
                          <div>
                            {typeof day.activities === 'string' ? (
                              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                {day.activities.split('\n').filter(line => line.trim()).map((line, lineIndex) => (
                                  <li key={lineIndex}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {cleanMarkdown(line.trim() || '暂无活动详情')}
                                    </ReactMarkdown>
                                  </li>
                                ))}
                              </ul>
                            ) : Array.isArray(day.activities) && day.activities.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                {day.activities.map((activity, activityIndex) => (
                                  <li key={activityIndex}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {cleanMarkdown(activity || '暂无活动详情')}
                                    </ReactMarkdown>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <Typography variant="body2" style={{ color: '#666' }}>暂无活动安排</Typography>
                            )}
                          </div>
                        ) : (
                          <Typography variant="body2" style={{ color: '#666' }}>暂无活动安排</Typography>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <Typography variant="body2" style={{ color: '#666' }}>暂无行程安排</Typography>
                )}
            </Paper>
            
            {/* 酒店推荐 */}
            <Typography variant="h6" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              酒店推荐
            </Typography>
            <Paper elevation={1} style={{ padding: '1rem', backgroundColor: 'white', marginBottom: '1rem' }}>
              {result.hotels && Array.isArray(result.hotels) && result.hotels.length > 0 ? (
                result.hotels.map((hotel, index) => (
                  <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < result.hotels.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                    <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>{hotel?.name || '酒店名称'}</Typography>
                    <Typography variant="body2">位置：{hotel?.location || '暂无位置信息'}</Typography>
                    <Typography variant="body2">价格：{hotel?.price || '暂无价格信息'}</Typography>
                    <Typography variant="body2">特色：{hotel?.features || '暂无特色信息'}</Typography>
                    <Typography variant="body2">推荐理由：{hotel?.reason || '暂无推荐理由'}</Typography>
                  </div>
                ))
              ) : (
                <Typography variant="body2" style={{ color: '#666' }}>暂无酒店推荐</Typography>
              )}
            </Paper>
            
            {/* 交通建议 */}
            <Typography variant="h6" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              交通建议
            </Typography>
            <Paper elevation={1} style={{ padding: '1rem', backgroundColor: 'white' }}>
              {result.transportation ? (
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanMarkdown(result.transportation || '暂无交通建议详情')}
                  </ReactMarkdown>
                </div>
              ) : (
                <Typography variant="body2" style={{ color: '#666' }}>暂无交通建议</Typography>
              )}
            </Paper>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;