<?php
namespace B2k\QlessGui;


use Qless\Client;

class APIService
{
    /**
     * @var array
     */
    private $config = [];
    /**
     * @var Client
     */
    private $client;
    /**
     * @var \Redis
     */
    private $redis;

    public function __construct()
    {
        $configPath = realpath(__DIR__.'/../../../').'/config.php';
        if (!file_exists($configPath)) {
            throw new \Exception('Config file missing');
        }
        $this->config = require($configPath);
        $this->client = new Client($this->config['redis']['host'], $this->config['redis']['port']);
        $this->redis = new \Redis();
        $this->redis->connect($this->config['redis']['host'], $this->config['redis']['port']);
    }

    /**
     * Return list of queues in the database
     */
    public function getQueues()
    {
        return $this->client->queues();
    }

    public function queueStatus($queue)
    {
        return $this->client->getQueue($queue)->stats();
    }

    public function completedJobs($start = 0, $count = 25)
    {
        return $this->client->jobs('complete', $start, $count);
    }

    public function failedJobs($start = 0, $count = 25)
    {
        return $this->client->jobs('failed', $start, $count);
    }

    public function queueLength($queue)
    {
        return $this->client->getQueue($queue)->length();
    }

    public function workers()
    {
        return $this->redis->zRange('ql:workers', 0, 999);
    }
}
