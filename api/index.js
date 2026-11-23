export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'AtCoder Profile Visualizer API is running'
  });
}
