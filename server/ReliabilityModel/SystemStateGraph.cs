using Microsoft.Research.Oslo;
using ReliabilityModel.Model.Helpers;
using ReliabilityModel.Model.System;
using System.Collections.Generic;
using System.Linq;

namespace ReliabilityModel.Model
{
    public class SystemStateGraph
    {
        private readonly MultipleModuleSystem _system;

        private IList<SystemState> _allPossibleStates;

        public SystemStateGraph(MultipleModuleSystem system, bool includeTerminal)
        {
            _system = system;

            _allPossibleStates = GetAllPossibleStates();
            Transitions = GetPossibleTransitions(includeTerminal);
        }

        public IReadOnlyList<SystemState> AllPossibleStates => (IReadOnlyList<SystemState>) _allPossibleStates;

        public IReadOnlyList<PossibleTransitions> Transitions { get; }

        private IReadOnlyList<PossibleTransitions> GetPossibleTransitions(bool includeTerminal)
        {
            var transitions = new List<PossibleTransitions>();

            foreach (var fromState in AllPossibleStates)
            {
                var transition = new PossibleTransitions(fromState);
                if (includeTerminal || !fromState.IsTerminal)
                {
                    foreach (var toState in AllPossibleStates)
                    {
                        var canTransitTo =
                            fromState.GetTransitionRate(toState, out var rate, out var isRecovering);

                        if (canTransitTo)
                        {
                            transition.ToSystemStates.Add(new SystemStateTransition
                            {
                                ToSystemState = toState,
                                IsRecovering = isRecovering,
                                WithRate = rate
                            });
                        }
                    }
                }

                transitions.Add(transition);
            }

            if (!includeTerminal)
            {
                var allDestinations = transitions
                    .SelectMany(transition => transition.ToSystemStates)
                    .Select(transition => transition.ToSystemState)
                    .ToList();

                transitions = transitions
                    .Where(transition =>
                        allDestinations.Contains(transition.SystemState) || transition.ToSystemStates.Any())
                    .ToList();

                _allPossibleStates = transitions.Select(transition => transition.SystemState).ToList();
            }

            return transitions;
        }

        public double[,] BuildWeightMatrix()
        {
            var equations = new double[AllPossibleStates.Count, AllPossibleStates.Count];
            for (var fromStateIdx = 0; fromStateIdx < AllPossibleStates.Count; fromStateIdx++)
            {
                var currentState = AllPossibleStates[fromStateIdx];

                var transitionsForState =
                    Transitions.SingleOrDefault(transition => transition.SystemState == currentState);

                if (transitionsForState == null)
                {
                    continue;
                }

                foreach (var nextState in transitionsForState.ToSystemStates)
                {
                    var toStateIdx = _allPossibleStates.IndexOf(nextState.ToSystemState);

                    equations[fromStateIdx, fromStateIdx] -= nextState.WithRate;
                    equations[toStateIdx, fromStateIdx] += nextState.WithRate;
                }
            }

            return equations;
        }

        public IReadOnlyList<WorkingProbability> GetProbability(double from, double to, double step)
        {
            var coefficients = BuildWeightMatrix();

            // The initial vector describes the situation when the first state
            // holds true - the state where all modules are working
            var initial = new Vector(Enumerable.Repeat(0.0, AllPossibleStates.Count).ToArray())
            {
                [0] = 1.0
            };

            var solution = Ode.RK547M(
                0,
                initial,
                (_, vector) => GetNextStateProbabilityDistribution(vector, coefficients));

            var workingIndices = AllPossibleStates
                .Select((state, index) => new { index, state.IsWorking })
                .Where(state => state.IsWorking)
                .Select(state => state.index)
                .ToArray();

            var points = solution.SolveFromToStep(from, to, step).ToArray();
            return points.Select(point => new WorkingProbability
            {
                Time = point.T,
                AggregatedProbability = point.X.ToArray().Where((_, index) => workingIndices.Contains(index)).Sum()
            }).ToList();
        }

        private static Vector GetNextStateProbabilityDistribution(Vector vector, double[,] coefficients)
        {
            var result = new double[vector.Length];

            for (var stateIndex = 0; stateIndex < result.Length; stateIndex++)
            {
                result[stateIndex] = 0;
                for (var componentIndex = 0; componentIndex < result.Length; componentIndex++)
                {
                    result[stateIndex] += coefficients[stateIndex, componentIndex] * vector[componentIndex];
                }
            }

            return new Vector(result);
        }

        private IList<SystemState> GetAllPossibleStates()
        {
            var singleModules = _system.Flatten();

            IReadOnlyList<IReadOnlyList<ModuleState>> allModulesStates = singleModules
                .Select(singleModule => singleModule.GetPossibleNextStates())
                .ToList();

            var maxValues = allModulesStates.Select(singleModuleStates => singleModuleStates.Count - 1).ToArray();
            var systemStates = new List<int[]>
            {
                Enumerable.Repeat(0, maxValues.Length).ToArray()
            };

            var integerOperator = new IntegerSetOperator(maxValues);
            while (!integerOperator.IsMax(systemStates.Last()))
            {
                systemStates.Add(integerOperator.Increment(systemStates.Last()));
            }

            return systemStates
                .Select((indices, index) =>
                    SystemState.FromModuleStatesIndices(_system, indices, allModulesStates, index))
                .ToList();
        }
    }
}