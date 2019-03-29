# ElasticSearch 简明入门

Create by zhangdx 2019/03/26.

实时分布式搜索和分析引擎。


## 是什么
* Lucene + 全文搜索
* 实时的文件存储，每个字段都可以被索引，并可被搜索
* 实时分析搜索引擎
* 可扩展，处理PB级结构化、非结构化数据
* 可以通过简单RESTful API、各种语言的客户端、甚至是命令行与之交互（HTTP 服务的典型优点）

## Installs 
* Java 环境
* Marvel 管理监控工具，一个插件

```
# 测试
$ curl -XGET 'localhost:9200/?pretty'
```

## 与Elasticsearch 交互
* Java API
* RESTful API

### 面向文档
* JSON 作为文档序列化格式

## 基础概念
* 索引（indexing）， 存储员工数据的行为。
* 搜索（search）， 
* 聚合（aggregations）

### 类比传统关系型数据库
Ralational DB -> Databases -> Tables -> Rows          -> Columns
Elasticsearch -> Indices       -> Types  -> Documents -> Fields
一对多。

## Index 
* 名称， 一个索引就像传统关系数据库中的数据库，复数为indices / indexes
* 动词【索引一个文档】， 把一个文档存储到索引里
* 倒排索引(Inverted index)，传统数据库为特定列增加一个索引，如B-Tree来加速索引

### create index
```
# add person-1
$ curl -XPUT 'localhost:9200/megacorp/employee/1'  -H 'Content-Type: application/json' -d'
{
    "first_name" : "John",
    "last_name" : "Smith",
    "age" : 25,
    "about" : "I love to go rock climbing",
    "interests": [ "sports", "music" ]
}'

# add person-2
$ curl -XPUT 'localhost:9200/megacorp/employee/2'  -H 'Content-Type: application/json' -d'
{
    "first_name" : "Jane",
    "last_name" : "Smith",
    "age" : 32,
    "about" : "I like to collect rock albums",
    "interests": [ "music" ]
}'

# add person-3
$ curl -XPUT 'localhost:9200/megacorp/employee/3'  -H 'Content-Type: application/json' -d'
{
    "first_name" : "Douglas",
    "last_name" : "Fir",
    "age" : 35,
    "about": "I like to build cabinets",
    "interests": [ "forestry" ]
}'
```

### search index
#### 检索文档
```
$ curl -XGET 'localhost:9200/megacorp/employee/1'
```
#### 简单查询
```
# 默认返回前10个结果
$ curl -XGET 'localhost:9200/megacorp/employee/_search'
# 搜索last_name 字段
$ curl -XGET 'localhost:9200/megacorp/employee/_search?q=last_name:smith'
```
#### DSL语句查询
```
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
	"query" : {
        "match" : {
            "last_name" : "Smith"
        }
	}
}'
```
#### 更复杂的搜索
```
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "query" : {
        "bool" : {
            "filter" : {
                "range" : {
                     "age" : { "gt" : 30 }
                }
            },
            "must" : {
                "match" : {
                    "last_name" : "Smith"
                }
            }
        }
    }
}'
```
中文版文档语法版本过时， filtered 已在ES5.0废弃， 使用bool/must/fiter。
gt = greater than。

#### 全文搜索
```
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "query" : {
        "match" : {
            "about" : "rock climbing"
        }
    }
}'
```
默认情况下，Elasticsearch 根据相关性评分来对结果集进行排序。是传统数据库很难实现的功能。

#### 短语搜索
```
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "query" : {
        "match_phrase" : {
            "about" : "rock climbing"
        }
    }
}'
```
#### 高亮搜索
```
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "query" : {
        "match_phrase" : {
            "about" : "rock climbing"
        }
    },
    "highlight": {
        "fields" : {
            "about" : {}
        }
    }
}'
```

## 分析/聚合 Aggregations
数据上生成复杂的分析统计，功能类 比SQL GROUP BY， 但更强大
```
# 基础语法
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "aggs" : {
        "all_interests" : {
            "terms" : {"field": "interests"}
        }
    }
}'

# 过滤字段
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "query": {
        "match": {
            "last_name": "smith"
        }
    },
    "aggs" : {
        "all_interests" : {
            "terms" : {"field": "interests"}
        }
    }
}'

# 分级汇总
$ curl -XGET 'localhost:9200/megacorp/employee/_search' -H 'Content-Type: application/json' -d'
{
    "aggs" : {
        "all_interests" : {
            "terms" : {"field": "interests"},
            "aggs" : {
                "avg_age" : {
                    "avg" : { "field" : "age" }
                }
            }
        }
    }
}'
```

根据官方文档显示，出现该错误是因为5.x之后，Elasticsearch对排序、聚合所依据的字段用单独的数据结构(fielddata)缓存到内存里了，但是在text字段上默认是禁用的，如果有需要单独开启，这样做的目的是为了节省内存空间。——官方文档地址：https://www.elastic.co/guide/en/elasticsearch/reference/current/fielddata.html

```
# 启用
$ curl -XPUT 'localhost:9200/megacorp/_mapping/employee' -H 'Content-Type: application/json' -d '
 {       
   "properties": {
         "interests": {  
             "type": "text",
             "fielddata": true        
         }       
    }         
 }'
```

## 分布式特性
分布式概念上透明化，不需要知道分布式系统、分片、集群发现等分布式概念，就可以在集群上工作。
Elasticsearch 隐藏分布式系统的复杂性。在底层自动完成：

* 文档分区到不同的容器或者分片，可以存于一个或多个节点
* 分片均匀分配到各个节点，对索引和搜索做负载均衡
* 冗余每个分片，防止硬件故障造成的数据丢失
* 将集群中任意一个节点的请求路由到相应的数据节点
* 无论是增加节点，还是移除节点，分片都可以无缝扩展和迁移

## 参考
* [Elasticsearch 权威指南中文版](https://elasticsearch.cn/book/elasticsearch_definitive_guide_2.x)
* [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
* https://www.cnblogs.com/hcy-fly/p/7908324.html



