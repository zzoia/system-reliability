using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ReliabilityModel.Model;
using ReliabilityModel.Model.Requests;
using ReliabilityModel.Model.Responses;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SystemReliabilityController : ControllerBase
    {
        public SystemReliabilityController()
        {
        }

        [HttpPost("test")]
        public IActionResult Test([FromBody] HybridSystemRequest hybridRequest)
        {
            if (hybridRequest.Type != ModuleType.Multiple)
            {
                return BadRequest();
            }

            SystemStateGraph systemStateGraph = ToSystemStateGraph(hybridRequest);
            var result = systemStateGraph.Transitions.Select(transition => new AdjacencyModel
            {
                FromState = ToModel(transition.SystemState),
                ToStates = transition.ToSystemStates.Select(ToTransition)
            });

            return Ok(result);
        }

        [HttpPost("plots")]
        public IActionResult GetPlot([FromBody] PlotRequest plotRequest)
        {
            if (plotRequest.HybridSystemRequest.Type != ModuleType.Multiple)
            {
                return BadRequest();
            }

            var result = new List<PlotResponse>();
            foreach (double failureRate in plotRequest.FailureRates)
            {
                var systemRequest = HybridToSystemRequest(plotRequest.HybridSystemRequest, single =>
                {
                    if (single.ModuleName == plotRequest.ModuleName)
                    {
                        single.FailureRate = failureRate;
                    }
                    return single;
                });
                var system = (MultipleModuleSystem)systemRequest.ToSystem();
                var graph = new SystemStateGraph(system, true);
                var plotData = graph.GetProbability(plotRequest.FromTime, plotRequest.ToTime, plotRequest.Step);

                result.Add(new PlotResponse
                {
                    FailureRate = failureRate,
                    ModuleName = plotRequest.ModuleName,
                    PlotData = plotData
                });
            }

            return Ok(result);
        }

        private static SystemStateGraph ToSystemStateGraph(HybridSystemRequest systemRequest)
        {
            var systemReques = HybridToSystemRequest(systemRequest, (_) => _);
            var system = (MultipleModuleSystem)systemReques.ToSystem();
            return new SystemStateGraph(system, true);
        }

        private static SystemRequest HybridToSystemRequest(
            HybridSystemRequest hybridRequest,
            Func<SingleModuleSystemRequest, SingleModuleSystemRequest> postConfigure)
            => hybridRequest.Type switch
            {
                ModuleType.Multiple => new MultipleModuleSystemRequest
                {
                    Dependency = hybridRequest.Dependency.Value,
                    Members = hybridRequest.Members.Select(member => HybridToSystemRequest(member, postConfigure))
                },
                ModuleType.Single => postConfigure(new SingleModuleSystemRequest
                {
                    FailureRate = hybridRequest.FailureRate,
                    Left = hybridRequest.Left == -1 ? (int?)null : hybridRequest.Left,
                    ModuleName = hybridRequest.ModuleName,
                    RecoveryRate = hybridRequest.RecoveryRate
                }),
                _ => throw new ArgumentOutOfRangeException(),
            };

        private static SystemStateTransitionModel ToTransition(SystemStateTransition transition)
            => new SystemStateTransitionModel
            {
                ToState = ToModel(transition.ToSystemState),
                IsRecovering = transition.IsRecovering,
                WithRate = transition.WithRate
            };

        private static SystemStateModel ToModel(SystemState systemState)
            => new SystemStateModel
            {
                Status = systemState.IsTerminal ? SystemStateStatus.Terminal : (systemState.IsWorking ? SystemStateStatus.Working : SystemStateStatus.WaitingRecovery),
                ModuleStates = systemState.ModuleStates.Select(state => new ModuleStateModel
                {
                    Left = state.Left,
                    IsWorking = state.IsWorking,
                    Name = state.Module.Name
                })
            };
    }
}
