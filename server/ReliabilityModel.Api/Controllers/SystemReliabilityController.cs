using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using ReliabilityModel.Api.Models.Requests;
using ReliabilityModel.Api.Models.Responses;
using ReliabilityModel.Model;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SystemReliabilityController : ControllerBase
    {
        [HttpPost("test")]
        public IActionResult Test([FromBody] HybridSystemRequest hybridRequest)
        {
            if (hybridRequest.Type != ModuleType.Multiple) return BadRequest();

            SystemStateGraph systemStateGraph = ToSystemStateGraph(hybridRequest);
            IEnumerable<AdjacencyModel> result = systemStateGraph.Transitions.Select(transition => new AdjacencyModel
            {
                FromState = ToModel(transition.SystemState),
                ToStates = transition.ToSystemStates.Select(ToTransition)
            });

            return Ok(result);
        }

        [HttpPost("plots")]
        public IActionResult GetPlot([FromBody] PlotRequest plotRequest)
        {
            if (plotRequest.HybridSystemRequest.Type != ModuleType.Multiple) return BadRequest();

            var result = new List<PlotResponse>();
            foreach (double failureRate in plotRequest.FailureRates)
            {
                SystemRequest systemRequest = HybridToSystemRequest(plotRequest.HybridSystemRequest, single =>
                {
                    if (single.ModuleName == plotRequest.ModuleName)
                        single.FailureRate = Math.Round(failureRate, 7, MidpointRounding.AwayFromZero);
                    return single;
                });
                var system = (MultipleModuleSystem) systemRequest.ToSystem();
                var graph = new SystemStateGraph(system, false);
                IReadOnlyList<WorkingProbability> plotData =
                    graph.GetProbability(plotRequest.FromTime, plotRequest.ToTime, plotRequest.Step);

                result.Add(new PlotResponse
                {
                    FailureRate = Math.Round(failureRate, 7, MidpointRounding.AwayFromZero),
                    ModuleName = plotRequest.ModuleName,
                    PlotData = plotData
                });
            }

            SystemRequest originalRequest = HybridToSystemRequest(plotRequest.HybridSystemRequest, _ => _);
            var originalSystem = (MultipleModuleSystem) originalRequest.ToSystem();
            var originalGraph = new SystemStateGraph(originalSystem, false);
            IReadOnlyList<WorkingProbability> originalPlotData =
                originalGraph.GetProbability(plotRequest.FromTime, plotRequest.ToTime, plotRequest.Step);

            result.Add(new PlotResponse
            {
                FailureRate = -1,
                ModuleName = plotRequest.ModuleName,
                PlotData = originalPlotData
            });

            return Ok(result);
        }

        [HttpPost("equation-system")]
        public IActionResult GetEquationSystem([FromBody] HybridSystemRequest hybridRequest)
        {
            if (hybridRequest.Type != ModuleType.Multiple) return BadRequest();

            SystemRequest systemRequest = HybridToSystemRequest(hybridRequest, _ => _);
            var system = (MultipleModuleSystem) systemRequest.ToSystem();
            var graph = new SystemStateGraph(system, false);
            double[,] matrix = graph.BuildWeightMatrix();

            var result = new List<List<double>>();
            var sb = new StringBuilder();
            for (var row = 0; row < matrix.GetLength(0); row++)
            {
                sb.Append($"P{row + 1}(t)/dt = ");
                var currentEq = new List<double>();
                for (var col = 0; col < matrix.GetLength(1); col++)
                {
                    matrix[row, col] = Math.Round(matrix[row, col], 7, MidpointRounding.AwayFromZero);
                    currentEq.Add(matrix[row, col]);
                    if (matrix[row, col] != 0)
                    {
                        string value = matrix[row, col] < 0
                            ? $" - {-1 * matrix[row, col]}"
                            : $" + {matrix[row, col]}";

                        sb.Append($"{value} * P{col + 1}(t)");
                    }
                }

                result.Add(currentEq);
                sb.AppendLine();
            }

            return Ok(new EquationSystemModel
            {
                Coefficients = result,
                SystemStates = graph.AllPossibleStates.Select(ToModel)
            });
        }

        private static SystemStateGraph ToSystemStateGraph(HybridSystemRequest systemRequest)
        {
            SystemRequest request = HybridToSystemRequest(systemRequest, _ => _);
            var system = (MultipleModuleSystem) request.ToSystem();
            return new SystemStateGraph(system, true);
        }

        private static SystemRequest HybridToSystemRequest(
            HybridSystemRequest hybridRequest,
            Func<SingleModuleSystemRequest, SingleModuleSystemRequest> postConfigure)
        {
            return hybridRequest.Type switch
            {
                ModuleType.Multiple => new MultipleModuleSystemRequest
                {
                    Dependency = hybridRequest.Dependency.Value,
                    Members = hybridRequest.Members.Select(member => HybridToSystemRequest(member, postConfigure))
                },
                ModuleType.Single => postConfigure(new SingleModuleSystemRequest
                {
                    FailureRate = hybridRequest.FailureRate,
                    Left = hybridRequest.Left == -1 ? (int?) null : hybridRequest.Left,
                    ModuleName = hybridRequest.ModuleName,
                    RecoveryRate = hybridRequest.RecoveryRate
                }),
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        private static SystemStateTransitionModel ToTransition(SystemStateTransition transition)
        {
            return new SystemStateTransitionModel
            {
                ToState = ToModel(transition.ToSystemState),
                IsRecovering = transition.IsRecovering,
                WithRate = transition.WithRate
            };
        }

        private static SystemStateModel ToModel(SystemState systemState)
        {
            return new SystemStateModel
            {
                Status = systemState.IsTerminal ? SystemStateStatus.Terminal :
                    systemState.IsWorking ? SystemStateStatus.Working : SystemStateStatus.WaitingRecovery,
                ModuleStates = systemState.ModuleStates.Select(state => new ModuleStateModel
                {
                    Left = state.RecoveriesLeft,
                    IsWorking = state.IsWorking,
                    Name = state.Module.Name
                })
            };
        }
    }
}